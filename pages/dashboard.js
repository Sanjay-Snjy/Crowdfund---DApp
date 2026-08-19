import { useAccount, useContractReads } from "wagmi";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Layout from "../components/Layout/Layout";
import DashboardStats from "../components/Dashboard/DashboardStats";
import CampaignCard from "../components/Campaign/CampaignCard";
import { useContract } from "../hooks/useContract";
import { CONTRACT_ADDRESS } from "../constants";
import { CROWDFUNDING_ABI } from "../constants/abi";
import { FiGrid, FiTrendingUp, FiUsers, FiTarget, FiActivity } from "react-icons/fi";
import { formatDate, formatEther } from "../utils/helpers";

function Dashboard() {
  const { address, isConnected } = useAccount();
  const { user } = useUser();
  const router = useRouter();
  const {
    useActiveCampaigns,
    useUserCampaignsWithDetails,
    useUserContributions,
  } = useContract();
  const currentUserName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "";

  const { data: activeCampaigns, isLoading: loadingActive } =
    useActiveCampaigns(0, 8);
  const { campaigns: userCampaigns, isLoading: loadingUserCampaignIds } =
    useUserCampaignsWithDetails(address);
  const { data: userContributions, isLoading: loadingContributionIds } =
    useUserContributions(address);
  const [transactionFeed, setTransactionFeed] = useState([]);

  const transactionCalls = useMemo(() => {
    if (!userContributions?.length || !address) return [];

    return userContributions.flatMap((campaignId) => {
      const numericId =
        typeof campaignId === "bigint"
          ? Number(campaignId)
          : Number(campaignId.toString());

      return [
        {
          address: CONTRACT_ADDRESS,
          abi: CROWDFUNDING_ABI,
          functionName: "getCampaign",
          args: [numericId],
        },
        {
          address: CONTRACT_ADDRESS,
          abi: CROWDFUNDING_ABI,
          functionName: "getCampaignContributions",
          args: [numericId],
        },
      ];
    });
  }, [userContributions, address]);

  const {
    data: transactionData,
    isLoading: loadingTransactionData,
  } = useContractReads({
    contracts: transactionCalls,
    enabled: transactionCalls.length > 0,
    watch: true,
  });

  const transactionLoading = loadingContributionIds || loadingTransactionData;

  useEffect(() => {
    if (!transactionData || !userContributions?.length || !address) {
      setTransactionFeed([]);
      return;
    }

    const normalizedAddress = address.toLowerCase();
    const feed = [];

    for (let i = 0; i < transactionData.length; i += 2) {
      const campaignResult = transactionData[i];
      const contributionsResult = transactionData[i + 1];

      if (
        campaignResult?.status === "success" &&
        contributionsResult?.status === "success"
      ) {
        const campaign = campaignResult.result;
        const contributions = contributionsResult.result || [];

        contributions.forEach((entry) => {
          if (
            entry?.contributor?.toString?.()?.toLowerCase?.() ===
            normalizedAddress
          ) {
            feed.push({
              campaignId: Number(campaign.id?.toString?.() || 0),
              campaignTitle: campaign.title || "Unknown campaign",
              action: "Contribution",
              amount: entry.amount,
              timestamp: Number(entry.timestamp?.toString?.() || 0),
            });
          }
        });
      }
    }

    setTransactionFeed(
      feed
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 6)
    );
  }, [transactionData, userContributions, address]);

  const successRate = userCampaigns?.length
    ? Math.round(
        (userCampaigns.filter((campaign) => {
          try {
            const raised = parseFloat(campaign.raisedAmount?.toString?.() || "0");
            const target = parseFloat(campaign.targetAmount?.toString?.() || "0");
            return target > 0 && raised >= target;
          } catch {
            return false;
          }
        }).length /
          userCampaigns.length) *
          100
      )
    : 0;

  const liveActiveCampaigns = useMemo(() => {
    if (!activeCampaigns?.length) return [];

    return activeCampaigns.filter((campaign) => {
      const deadline = Number(campaign?.deadline?.toString?.() || 0);
      return campaign?.active && deadline * 1000 > Date.now();
    });
  }, [activeCampaigns]);

  const liveActiveCampaignsCount = liveActiveCampaigns.length;

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  }, []);

  if (!isConnected) {
    return (
      <Layout>
        <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
          <div className="rounded-[32px] border border-slate-200 bg-white/90 p-10 text-center shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950 dark:text-white">
            <h2 className="text-3xl font-semibold mb-3">Connect Your Wallet</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Please connect your wallet to access your Crowdfunding dashboard.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto px-5 ml-1 py-8 sm:px-6 lg:px-0 lg:py-0 -mt-[18px]">
       <section className="mb-4 rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 p-8 text-white shadow-sm shadow-slate-900/20">
  <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium backdrop-blur">
        <FiGrid className="h-4 w-4" />
        Dashboard Overview
      </div>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        Ideas backed. Progress visible.
      </h1>

      <p className="mt-2 max-w-2xl text-sm text-slate-200">
        Everything you’re building and backing, in one place.
      </p>
    </div>
  </div>
</section>
        <div className="grid gap-4 xl:grid-cols-[1.45fr_0.75fr]">
          <section className="rounded-[32px]  bg-[#F5F5F5] backdrop-blur-sm dark:bg-darkb border border-secondary dark:border-gray-450 p-8 shadow-xl shadow-slate-200/30 dark:text-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-blue-800 dark:text-slate-400">
                  Your Space
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
                  Your crowdfunding insights
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">
                  Monitor your campaign metrics, recent activity, and featured projects from one elegant workspace.
                </p>
              </div>
             
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[28px] border border-secondary bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Created campaigns</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{userCampaigns?.length || 0}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Campaigns you have launched.</p>
              </div>
              <div className="rounded-[28px] border border-secondary bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total contributions</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{userContributions?.length || 0}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your active backers on the platform.</p>
              </div>
              <div className="rounded-[28px] border border-secondary bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active campaigns</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{liveActiveCampaignsCount || 0}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Live campaigns on the marketplace.</p>
              </div>
              <div className="rounded-[28px] border border-secondary bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Success rate</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{successRate}%</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Share of your campaigns that met the goal.</p>
              </div>
            </div>
             <div className="mt-[50px] ml-[200px] flex flex-wrap gap-3">
                <button
                  onClick={() => router.push("/create-campaign")}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
                >
                  Launch campaign
                </button>
                <button
                  onClick={() => router.push("/campaigns")}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                >
                  Browse projects
                </button>
              </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[32px] bg-[#F5F5F5] backdrop-blur-sm dark:bg-darkb border border-secondary dark:border-gray-450 p-6 shadow-xl shadow-slate-200/20">
              <p className="text-sm uppercase tracking-[0.24em] text-blue-800 dark:text-slate-400">Recent transactions</p>
              <div className="mt-5 space-y-4">
                {transactionLoading ? (
                  [...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="mt-3 h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
                    </div>
                  ))
                ) : transactionFeed.length > 0 ? (
                  transactionFeed.map((tx, index) => (
                    <div
                      key={index}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{tx.action} to {tx.campaignTitle}</p>
                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{formatDate(tx.timestamp)}</p>
                        </div>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{formatEther(tx.amount)} ETH</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">No recent transactions yet</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your latest contributions will appear here once you participate in a campaign.</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <div className="rounded-[32px] bg-[#F5F5F5] backdrop-blur-sm dark:bg-darkb border border-secondary dark:border-gray-450 p-6 shadow-xl shadow-slate-200/20">
            <p className="text-sm uppercase tracking-[0.24em] text-blue-800 dark:text-slate-400">Quick insights</p>
            <div className="mt-4 space-y-4">
              <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Active campaigns</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{liveActiveCampaignsCount || 0}</p>
                  </div>
                  <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                    {liveActiveCampaignsCount ? liveActiveCampaigns[0]?.title || "—" : "None"}
                  </span>
                </div>
               
              </div>
              <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Created campaigns</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{userCampaigns?.length || 0}</p>
                  </div>
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {userCampaigns?.length ? "View list" : "None"}
                  </span>
                </div>
                <div className="mt-4 max-h-36 overflow-y-auto pr-1">
                  {userCampaigns && userCampaigns.length > 0 ? (
                    userCampaigns.map((campaign, idx) => (
                      <p
                        key={campaign?.id ?? idx}
                        className="truncate text-sm text-slate-600 dark:text-slate-400"
                      >
                        {campaign?.title || campaign?.description || `Campaign ${campaign?.id ?? idx + 1}`}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No created campaigns yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] bg-[#F5F5F5] backdrop-blur-sm dark:bg-darkb border border-secondary dark:border-gray-450 p-6 shadow-xl shadow-slate-200/20 dark:text-white">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Activity snapshot</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">No activity yet</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your campaign events will appear here once funding begins.</p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-4 rounded-[32px] bg-[#F5F5F5] backdrop-blur-sm dark:bg-darkb border border-secondary dark:border-gray-450 p-8 shadow-xl shadow-slate-200/30  dark:text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Platform statistics</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Marketplace performance metrics across all campaigns.</p>
            </div>
          </div>
          <div className="mt-6">
            <DashboardStats />
          </div>
        </section>

        

        <section className="mt-4 rounded-[32px] bg-[#F5F5F5] backdrop-blur-sm dark:bg-darkb border border-secondary  p-8 shadow-xl shadow-slate-200/30 dark:bg-slate-950 dark:text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Recent activity</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Track approvals, contributions, and campaign updates.</p>
            </div>
            <span className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              Live feed
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">No activity yet</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Once you launch a campaign, your progress and contributions will appear here.</p>
                </div>
                <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">Pending</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Dashboard;
