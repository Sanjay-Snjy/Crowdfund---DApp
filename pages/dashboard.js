import { useAccount, useContractReads } from "wagmi";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import Layout from "../components/Layout/Layout";
import DashboardStats from "../components/Dashboard/DashboardStats";
import FundingProgress from "../components/Dashboard/FundingProgress";

import NotificationCenter from "../components/Dashboard/NotificationCenter";
import DeadlineCountdown from "../components/Dashboard/DeadlineCountdown";

import MilestoneTracker from "../components/Dashboard/MilestoneTracker";
import QuickActions from "../components/Dashboard/QuickActions";
import WithdrawFundsButton from "../components/Dashboard/WithdrawFundsButton";
import BookmarkedCampaigns from "../components/Dashboard/BookmarkedCampaigns";
import { useContract } from "../hooks/useContract";
import { CONTRACT_ADDRESS } from "../constants";
import { CROWDFUNDING_ABI } from "../constants/abi";
import { FiGrid, FiTrendingUp, FiTarget, FiActivity } from "react-icons/fi";
import { formatDate, formatEther } from "../utils/helpers";
import Link from "next/link";

function Dashboard() {
  const { address, isConnected } = useAccount();
  const { user } = useUser();
  const router = useRouter();
  const { useActiveCampaigns, useUserCampaignsWithDetails, useUserContributions } = useContract();

  const currentUserName = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "";

  const { data: activeCampaigns, refetch: refetchActive } = useActiveCampaigns(0, 100);
  const { campaigns: userCampaigns, isLoading: loadingUserCampaigns, campaignIds: userCampaignIds } = useUserCampaignsWithDetails(address);
  const { data: userContributions } = useUserContributions(address);

  // Transaction feed
  const [transactionFeed, setTransactionFeed] = useState([]);
  const transactionCalls = useMemo(() => {
    if (!userContributions?.length || !address) return [];
    return userContributions.flatMap((id) => {
      const num = typeof id === "bigint" ? Number(id) : Number(id.toString());
      return [
        { address: CONTRACT_ADDRESS, abi: CROWDFUNDING_ABI, functionName: "getCampaign", args: [num] },
        { address: CONTRACT_ADDRESS, abi: CROWDFUNDING_ABI, functionName: "getCampaignContributions", args: [num] },
      ];
    });
  }, [userContributions, address]);

  const { data: txData, isLoading: loadingTx } = useContractReads({ contracts: transactionCalls, enabled: transactionCalls.length > 0 });

  useEffect(() => {
    if (!txData || !userContributions?.length || !address) { setTransactionFeed([]); return; }
    const norm = address.toLowerCase();
    const feed = [];
    for (let i = 0; i < txData.length; i += 2) {
      const camp = txData[i]; const contribs = txData[i + 1];
      if (camp?.status === "success" && contribs?.status === "success") {
        contribs.result?.forEach((e) => {
          if (e?.contributor?.toString?.()?.toLowerCase() === norm) {
            feed.push({ campaignId: Number(camp.result.id?.toString?.()), campaignTitle: camp.result.title, action: "Contribution", amount: e.amount, timestamp: Number(e.timestamp?.toString?.() || 0) });
          }
        });
      }
    }
    setTransactionFeed(feed.sort((a, b) => b.timestamp - a.timestamp).slice(0, 6));
  }, [txData, userContributions, address]);

  const liveActive = useMemo(() => (activeCampaigns || []).filter((c) => c?.active && Number(c.deadline?.toString?.() || 0) * 1000 > Date.now()), [activeCampaigns]);

  const refreshData = useCallback(() => {
    refetchActive?.();
  }, [refetchActive]);

  if (!isConnected) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="card p-8 text-center max-w-sm">
            <h2 className="text-lg font-bold mb-2" style={{ color: "var(--color-text)" }}>Connect Your Wallet</h2>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Connect your wallet to access your dashboard.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-8xl mx-auto pl-4  sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
              {currentUserName ? `Welcome back, ${currentUserName}` : "Your crowdfunding overview"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Feature #8: Notification Center */}
            <NotificationCenter
              userCampaigns={userCampaigns}
              userContributions={userContributions}
              transactionFeed={transactionFeed}
            />
            <Link href="/create-campaign" className="btn btn-sm rounded-3xl px-4">New Campaign</Link>
            <Link href="/all-campaigns" className="btn btn-secondary btn-sm rounded-3xl px-4">Browse</Link>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Created", value: userCampaigns?.length || 0 },
            { label: "Contributions", value: userContributions?.length || 0 },
            { label: "Active Campaigns", value: liveActive.length },
          ].map((s) => (
            <div key={s.label} className="card p-4 rounded-3xl">
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{s.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: "var(--color-text)" }}>{s.value}</p>
            </div>
          ))}
          <div className="card p-4 rounded-3xl">
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Connected</p>
            <p className="text-sm font-medium mt-1" style={{ color: "var(--color-success)" }}>{address?.slice(0, 6)}...{address?.slice(-4)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent transactions */}
          <div className="lg:col-span-2 card p-5 rounded-3xl">
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text)" }}>Recent Transactions</h3>
            {loadingTx ? (
              <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-14" />)}</div>
            ) : transactionFeed.length > 0 ? (
              <div className="space-y-2">
                {transactionFeed.map((tx, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--color-surface-raised, var(--color-surface))" }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{tx.action} → {tx.campaignTitle}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{formatDate(tx.timestamp)}</p>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{formatEther(tx.amount)} ETH</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-center py-6" style={{ color: "var(--color-text-muted)" }}>No transactions yet</p>
            )}
          </div>

          {/* Created campaigns with progress bars and countdown */}
          <div className="card p-5 rounded-3xl">
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text)" }}>Your Campaigns</h3>
            {loadingUserCampaigns ? (
              <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-10" />)}</div>
            ) : userCampaigns?.length > 0 ? (
              <div className="space-y-3">
                {userCampaigns.slice(0, 4).map((c) => (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Link href={`/campaign/${c.id}`} className="text-xs font-medium truncate max-w-[70%] hover:underline" style={{ color: "var(--color-text)" }}>
                        {c.title || `Campaign #${c.id}`}
                      </Link>
                      {/* Feature #10: Deadline Countdown */}
                      {c.active && <DeadlineCountdown deadline={c.deadline} />}
                    </div>
                    {/* Feature #1: Funding Progress Bars */}
                    <FundingProgress campaign={c} />
                    {/* Feature #13: Withdraw Funds Button */}
                    <WithdrawFundsButton campaign={c} onRefresh={refreshData} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No campaigns yet</p>
                <Link href="/create-campaign" className="btn btn-sm mt-2">Create One</Link>
              </div>
            )}
          </div>
        </div>

        {/* Feature #14: Milestone Progress Tracker */}
        {userCampaigns?.length > 0 && (
          <div className="card p-5 rounded-3xl">
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text)" }}>
              Milestone Progress
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {userCampaigns.slice(0, 6).map((c) => (
                <div key={c.id} className="p-3 rounded-xl" style={{ background: "var(--color-surface)" }}>
                  <Link href={`/campaign/${c.id}`} className="text-xs font-medium block truncate mb-2 hover:underline" style={{ color: "var(--color-text)" }}>
                    {c.title || `Campaign #${c.id}`}
                  </Link>
                  <MilestoneTracker campaignId={c.id} campaign={c} />
                </div>
              ))}
            </div>
          </div>
        )}



        {/* Feature #18: Bookmarked Campaigns + Platform Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card p-5 rounded-3xl">
              <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text)" }}>Platform Statistics</h3>
              <DashboardStats />
            </div>
          </div>
          <BookmarkedCampaigns />
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
