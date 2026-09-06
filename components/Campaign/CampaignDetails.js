import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useAccount, useContractRead, useContractReads } from "wagmi";
import { useUser } from "@clerk/nextjs";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import {
  FiUser, FiClock, FiTarget, FiShare2, FiHeart, FiUsers, FiCalendar, FiBookmark,
} from "react-icons/fi";
import { useContract } from "../../hooks/useContract";
import { getFromIPFS } from "../../utils/ipfs";
import { useBookmarks } from "../../hooks/useBookmarks";
import {
  formatEther, calculateTimeLeft, calculateProgress, formatDate,
  copyToClipboard, getCreatorDisplayName, formatAddress,
} from "../../utils/helpers";
import { CONTRACT_ADDRESS } from "../../constants";
import { CROWDFUNDING_ABI } from "../../constants/abi";

const TABS = ["Overview", "Milestones", "Contributors"];

export default function CampaignDetails({ campaignId }) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { user } = useUser();
  const { toggle, isBookmarked } = useBookmarks();
  const {
    useCampaign, useCampaignStats, useContributeToCampaignSimple, useWithdrawFunds, useGetRefund,
    useAddMilestone, useRequestMilestoneVote, useVoteOnMilestone, useReleaseMilestoneFunds,
    useCampaignMilestones, useContribution,
  } = useContract();

  const [metadata, setMetadata] = useState(null);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [contributionAmount, setContributionAmount] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDesc, setNewMilestoneDesc] = useState("");
  const [newMilestoneAmount, setNewMilestoneAmount] = useState("");

  const { data: campaign, isLoading: campaignLoading } = useCampaign(campaignId);
  const { data: stats } = useCampaignStats(campaignId);
  const { data: userContribution } = useContribution(campaignId, address);
  const { contribute, isLoading: contributing } = useContributeToCampaignSimple();
  const { withdrawFunds, isLoading: withdrawing } = useWithdrawFunds();
  const { getRefund, isLoading: refunding } = useGetRefund();
  const { addMilestone, isLoading: addingMilestone } = useAddMilestone();
  const { requestMilestoneVote, isLoading: requestingVote } = useRequestMilestoneVote();
  const { voteOnMilestone, isLoading: voting } = useVoteOnMilestone();
  const { releaseMilestoneFunds, isLoading: releasing } = useReleaseMilestoneFunds();
  const { data: milestones, count: milestonesCount, isLoading: loadingMilestones } = useCampaignMilestones(campaignId);

  const bookmarked = isBookmarked(campaignId);

  const milestoneVoteCalls = useMemo(() => {
    if (!campaignId || !address || !milestonesCount || milestonesCount === 0) return [];
    return Array.from({ length: milestonesCount }, (_, i) => ({
      address: CONTRACT_ADDRESS, abi: CROWDFUNDING_ABI,
      functionName: "hasVotedOnMilestone", args: [campaignId, i, address],
    }));
  }, [campaignId, address, milestonesCount]);

  const { data: voteData } = useContractReads({ contracts: milestoneVoteCalls, enabled: milestoneVoteCalls.length > 0 });
  const voteStatuses = useMemo(() => voteData?.map((r) => r?.status === "success" ? r.result : false) || [], [voteData]);

  const { data: contributions, isLoading: loadingContributions } = useContractRead({
    address: CONTRACT_ADDRESS, abi: CROWDFUNDING_ABI,
    functionName: "getCampaignContributions", args: [campaignId],
    enabled: Boolean(campaignId && CONTRACT_ADDRESS),
  });

  // Fetch metadata
  useEffect(() => {
    if (!campaign?.metadataHash) return;
    let cancelled = false;
    getFromIPFS(campaign.metadataHash).then((res) => {
      if (!cancelled && res.success) setMetadata(res.data);
    });
    return () => { cancelled = true; };
  }, [campaign?.metadataHash]);

  // Fetch creator profile
  useEffect(() => {
    if (!campaign?.creator) { setCreatorProfile(null); return; }
    const addr = campaign.creator.toString?.()?.toLowerCase();
    if (!addr) return;
    const controller = new AbortController();
    fetch(`/api/wallet-link?walletAddresses=${encodeURIComponent(addr)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.walletProfiles) && data.walletProfiles.length > 0) setCreatorProfile(data.walletProfiles[0]);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [campaign?.creator]);

  if (campaignLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 space-y-4">
        <div className="skeleton h-64 sm:h-80" />
        <div className="skeleton h-6 w-2/3" />
        <div className="skeleton h-4 w-1/2" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>Campaign Not Found</h2>
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          The campaign doesn't exist or has been removed.
        </p>
        <button onClick={() => router.push("/all-campaigns")} className="btn btn-secondary mt-4">
          Browse Campaigns
        </button>
      </div>
    );
  }

  const progress = calculateProgress(campaign.raisedAmount, campaign.targetAmount);
  const timeLeft = calculateTimeLeft(campaign.deadline);
  const raised = parseFloat(formatEther(campaign.raisedAmount)).toFixed(2);
  const target = parseFloat(formatEther(campaign.targetAmount)).toFixed(2);
  const currentUserName = user?.fullName || user?.firstName || "";
  const creatorName = getCreatorDisplayName(campaign.creator, metadata?.creator, creatorProfile, address, currentUserName);
  const isCreator = address?.toLowerCase() === campaign.creator?.toLowerCase();
  const isSuccessful = parseFloat(raised) >= parseFloat(target);
  const canWithdraw = isCreator && timeLeft.expired && isSuccessful && !campaign.withdrawn;
  const canRefund = !isCreator && timeLeft.expired && !isSuccessful && userContribution > 0;

  // Process contributions
  const processed = contributions && !loadingContributions
    ? contributions.map((c) => ({ contributor: c.contributor, amount: c.amount, timestamp: c.timestamp ? Number(c.timestamp.toString()) : null }))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    : [];

  const contributorMap = {};
  processed.forEach((c) => {
    if (!contributorMap[c.contributor]) contributorMap[c.contributor] = { address: c.contributor, total: 0n, count: 0 };
    contributorMap[c.contributor].total += BigInt(c.amount.toString());
    contributorMap[c.contributor].count += 1;
  });
  const uniqueContributors = Object.values(contributorMap).sort((a, b) => Number(b.total - a.total));

  const QUICK_AMOUNTS = ["0.01", "0.05", "0.1", "0.5", "1"];

  const handleContribute = async () => {
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) { toast.error("Enter a valid amount"); return; }
    try {
      await contribute?.({ args: [campaignId], value: ethers.utils.parseEther(contributionAmount) });
      setContributionAmount("");
    } catch (err) { console.error(err); }
  };

  const handleShare = async () => {
    const ok = await copyToClipboard(window.location.href);
    toast.success(ok ? "Link copied!" : "Failed to copy");
  };

  const handleBookmark = () => {
    toggle(campaignId);
    toast.success(bookmarked ? "Removed from saved" : "Saved to bookmarks");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Hero image */}
      <div className="card overflow-hidden">
        <div className="relative h-56 sm:h-72">
          {metadata?.image ? (
            <img src={metadata.image} alt={campaign.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--color-surface-raised)" }}>
              <span className="text-5xl font-bold" style={{ color: "var(--color-text-muted)" }}>{campaign.title?.charAt(0) || "C"}</span>
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`badge ${campaign.active ? "badge-success" : "badge-error"}`}>
              {campaign.active ? "Active" : "Ended"}
            </span>
            {isSuccessful && <span className="badge badge-warning">Funded</span>}
          </div>
          <div className="absolute top-3 right-3 flex gap-1.5">
            <button onClick={handleBookmark}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                bookmarked ? "bg-indigo-600 text-white" : "bg-black/40 text-white hover:bg-black/60"}`}>
              <FiBookmark className="w-4 h-4" fill={bookmarked ? "currentColor" : "none"} />
            </button>
            <button onClick={handleShare}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/40 text-white hover:bg-black/60 transition-colors">
              <FiShare2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--color-text)" }}>{campaign.title}</h1>

          <div className="mt-2 flex items-center gap-3 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <span className="flex items-center gap-1"><FiUser className="w-3.5 h-3.5" /> {creatorName}</span>
            {isCreator && <span className="badge badge-neutral">(You)</span>}
          </div>

          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{campaign.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="card">
            <div className="border-b flex gap-1 px-1 overflow-x-auto" style={{ borderColor: "var(--color-border)" }}>
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent hover:border-slate-300"
                  }`}
                  style={activeTab === tab ? undefined : { color: "var(--color-text-muted)" }}
                >
                  {tab}
                  {tab === "Contributors" && uniqueContributors.length > 0 && (
                    <span className="ml-1.5 text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
                      {uniqueContributors.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* Overview tab */}
              {activeTab === "Overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                      <span style={{ color: "var(--color-text-muted)" }}>Created:</span>
                      <span style={{ color: "var(--color-text)" }}>{formatDate(campaign.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                      <span style={{ color: "var(--color-text-muted)" }}>Deadline:</span>
                      <span style={{ color: "var(--color-text)" }}>{formatDate(campaign.deadline)}</span>
                    </div>
                    {metadata?.category && (
                      <div className="flex items-center gap-2">
                        <FiTarget className="w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                        <span style={{ color: "var(--color-text-muted)" }}>Category:</span>
                        <span style={{ color: "var(--color-text)" }}>{metadata.category}</span>
                      </div>
                    )}
                  </div>
                  {metadata?.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {metadata.tags.map((tag, i) => (
                        <span key={i} className="badge badge-neutral">{tag}</span>
                      ))}
                    </div>
                  )}
                  {metadata?.additionalInfo && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1" style={{ color: "var(--color-text)" }}>Additional Info</h4>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{metadata.additionalInfo}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Milestones tab */}
              {activeTab === "Milestones" && (
                <div className="space-y-4">
                  {isCreator && (
                    <div className="p-4 rounded-lg border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface-raised)" }}>
                      <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>Add Milestone</h4>
                      <div className="grid gap-3">
                        <input placeholder="Title" value={newMilestoneTitle} onChange={(e) => setNewMilestoneTitle(e.target.value)} className="input" />
                        <textarea placeholder="Description" value={newMilestoneDesc} onChange={(e) => setNewMilestoneDesc(e.target.value)} className="input resize-none" rows={2} />
                        <input type="number" min="0.01" step="0.01" placeholder="Amount (ETH)" value={newMilestoneAmount} onChange={(e) => setNewMilestoneAmount(e.target.value)} className="input" />
                        <button
                          onClick={async () => {
                            if (!newMilestoneTitle || !newMilestoneDesc || !newMilestoneAmount) { toast.error("Fill all fields"); return; }
                            try {
                              await addMilestone?.({ args: [campaignId, newMilestoneTitle, newMilestoneDesc, ethers.utils.parseEther(newMilestoneAmount)] });
                              setNewMilestoneTitle(""); setNewMilestoneDesc(""); setNewMilestoneAmount("");
                            } catch (err) { console.error(err); }
                          }}
                          disabled={addingMilestone}
                          className="btn btn-sm"
                        >
                          {addingMilestone ? "Adding..." : "Add Milestone"}
                        </button>
                      </div>
                    </div>
                  )}

                  {loadingMilestones ? (
                    <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-20" />)}</div>
                  ) : milestones?.length > 0 ? (
                    milestones.map((m, i) => (
                      <div key={i} className="card p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>{m.title}</h4>
                            <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>{m.description}</p>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <span className={`badge ${m.completed ? "badge-success" : "badge-neutral"}`}>{m.completed ? "Done" : "Pending"}</span>
                            <span className={`badge ${m.fundsReleased ? "badge-success" : "badge-warning"}`}>{m.fundsReleased ? "Released" : "Locked"}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-xs" style={{ color: "var(--color-text-muted)" }}>
                          <span>{formatEther(m.amount)} ETH</span>
                          <span>{m.approvals} approvals</span>
                          <span>{m.rejections} rejections</span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          {isCreator && !m.voteRequested && !m.fundsReleased && (
                            <button onClick={() => requestMilestoneVote?.({ args: [campaignId, i] })} disabled={requestingVote} className="btn btn-sm btn-secondary">
                              Request Vote
                            </button>
                          )}
                          {isCreator && m.voteRequested && !m.fundsReleased && (
                            <button onClick={() => releaseMilestoneFunds?.({ args: [campaignId, i] })} disabled={releasing} className="btn btn-sm">
                              Release Funds
                            </button>
                          )}
                          {!isCreator && m.voteRequested && !m.fundsReleased && !voteStatuses[i] && (
                            <>
                              <button onClick={() => voteOnMilestone?.({ args: [campaignId, i, true] })} disabled={voting} className="btn btn-sm" style={{ background: "var(--color-success)", color: "#fff" }}>
                                Approve
                              </button>
                              <button onClick={() => voteOnMilestone?.({ args: [campaignId, i, false] })} disabled={voting} className="btn btn-sm btn-danger">
                                Reject
                              </button>
                            </>
                          )}
                          {!isCreator && voteStatuses[i] && (
                            <span className="text-xs font-medium" style={{ color: "var(--color-success)" }}>You voted</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-center py-8" style={{ color: "var(--color-text-muted)" }}>No milestones yet</p>
                  )}
                </div>
              )}

              {/* Contributors tab */}
              {activeTab === "Contributors" && (
                <div>
                  {loadingContributions ? (
                    <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-14" />)}</div>
                  ) : uniqueContributors.length > 0 ? (
                    <div className="space-y-2">
                      {uniqueContributors.map((c, i) => (
                        <div key={c.address} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "var(--color-accent)" }}>
                              #{i + 1}
                            </div>
                            <div>
                              <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                                {formatAddress(c.address)}
                                {c.address.toLowerCase() === address?.toLowerCase() && <span className="ml-1 text-xs" style={{ color: "var(--color-accent)" }}>(You)</span>}
                              </p>
                              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{c.count} contribution{c.count !== 1 ? "s" : ""}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{formatEther(c.total)} ETH</p>
                            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{((Number(formatEther(c.total)) / parseFloat(raised || 1)) * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiUsers className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--color-text-muted)" }} />
                      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No contributors yet. Be the first!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          {/* Progress card */}
          <div className="card p-5">
            <div className="flex items-center justify-between text-sm mb-2">
              <span style={{ color: "var(--color-text-secondary)" }}>Progress</span>
              <span className="font-medium" style={{ color: "var(--color-accent)" }}>{progress.toFixed(1)}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-surface-raised)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%`, background: "var(--color-accent)" }} />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <p className="text-lg font-bold" style={{ color: "var(--color-text)" }}>{raised}</p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>ETH Raised</p>
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: "var(--color-text)" }}>{target}</p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>ETH Target</p>
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: "var(--color-text)" }}>{uniqueContributors.length}</p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Contributors</p>
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: "var(--color-text)" }}>{timeLeft.expired ? "—" : timeLeft.text}</p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{timeLeft.expired ? "Expired" : "Left"}</p>
              </div>
            </div>

            {/* User's contribution */}
            {userContribution > 0 && (
              <div className="mt-4 p-3 rounded-lg text-sm" style={{ background: "var(--color-accent-light)", color: "var(--color-accent)" }}>
                Your contribution: <span className="font-semibold">{formatEther(userContribution)} ETH</span>
              </div>
            )}
          </div>

          {/* Action card */}
          <div className="card p-5 space-y-3">
            {!timeLeft.expired && campaign.active && !isCreator && isConnected && (
              <>
                <div className="flex gap-1.5 flex-wrap">
                  {QUICK_AMOUNTS.map((amt) => (
                    <button key={amt} onClick={() => setContributionAmount(amt)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                        contributionAmount === amt
                          ? "bg-indigo-600 text-white"
                          : "border hover:bg-slate-50 dark:hover:bg-slate-700/30"
                      }`}
                      style={contributionAmount === amt ? undefined : { borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>
                      {amt} ETH
                    </button>
                  ))}
                </div>
                <input
                  type="number" step="0.01" min="0.01" placeholder="Amount (ETH)"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  className="input"
                />
                <button onClick={handleContribute} disabled={contributing || !contributionAmount} className="btn w-full">
                  {contributing ? "Contributing..." : "Contribute Now"}
                </button>
              </>
            )}

            {canWithdraw && (
              <button onClick={async () => { await withdrawFunds?.({ args: [campaignId] }); }} disabled={withdrawing} className="btn w-full" style={{ background: "var(--color-success)", color: "#fff" }}>
                {withdrawing ? "Withdrawing..." : "Withdraw Funds"}
              </button>
            )}

            {canRefund && (
              <button onClick={async () => { await getRefund?.({ args: [campaignId] }); }} disabled={refunding} className="btn btn-danger w-full">
                {refunding ? "Processing..." : "Get Refund"}
              </button>
            )}

            {!isConnected && (
              <p className="text-sm text-center py-2" style={{ color: "var(--color-text-muted)" }}>Connect wallet to contribute</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
