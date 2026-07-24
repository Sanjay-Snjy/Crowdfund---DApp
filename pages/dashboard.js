import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Layout from "../components/Layout/Layout";
import DashboardStats from "../components/Dashboard/DashboardStats";
import CampaignCard from "../components/Campaign/CampaignCard";
import { useContract } from "../hooks/useContract";
import { FiGrid, FiTrendingUp, FiUsers, FiTarget, FiActivity } from "react-icons/fi";

function Dashboard() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { useActiveCampaigns, useUserCampaigns, useUserContributions } =
    useContract();

  const { data: activeCampaigns, isLoading: loadingActive } =
    useActiveCampaigns(0, 8);
  const { data: userCampaigns } = useUserCampaigns(address);
  const { data: userContributions } = useUserContributions(address);

  const successRate = userCampaigns?.length
    ? Math.round(
        (userCampaigns.filter((campaign) => {
          try {
            const raised = parseFloat(campaign.raisedAmount?.toString() || "0");
            const target = parseFloat(campaign.targetAmount?.toString() || "0");
            return target > 0 && raised >= target;
          } catch {
            return false;
          }
        }).length /
          userCampaigns.length) *
          100
      )
    : 0;

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
      <div className="mx-auto px-5 ml-3 py-8 sm:px-6 lg:px-0 lg:py-0 -mt-3">
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
                <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{activeCampaigns?.length || 0}</p>
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
            <div className="rounded-[32px] bg-[#F5F5F5] backdrop-blur-sm dark:bg-darkb border border-secondary dark:border-gray-450 p-6 shadow-xl shadow-slate-200/20 ">
              <p className="text-sm uppercase tracking-[0.24em] text-blue-800 dark:text-slate-400">Quick insights</p>
              <div className="mt-4 space-y-4">
                <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-900">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Active campaigns</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{activeCampaigns?.length || 0}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Created campaigns</p>
                      <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{userCampaigns?.length || 0}</p>
                    </div>
                    <button
                      onClick={() => router.push("/my-campaigns")}
                      className="inline-flex items-center justify-center mt-8 rounded-full bg-blue-600 px-2 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-blue-700"
                    >
                      View my campaigns
                    </button>
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
          </aside>
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

        <section className="mt-4 rounded-[32px] bg-[#F5F5F5] backdrop-blur-sm dark:bg-darkb border border-secondary dark:border-gray-450 p-8 shadow-xl shadow-slate-200/30  dark:text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Featured campaigns</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Highlighted campaigns worth exploring now.</p>
            </div>
           <button
  type="button"
  onClick={() => router.push("/campaigns")}
  className="
    group relative z-10
    inline-flex items-center justify-center gap-2
    overflow-hidden rounded-full border-2 border-gray-50
    bg-gray-50 px-4 py-2
    text-sm text-gray-900
    shadow-sm backdrop-blur-md
    transition-colors
    border border-secondary

    before:absolute
    before:-left-full
    before:-z-10
    before:aspect-square
    before:w-full
    before:rounded-full
    before:bg-blue-600
    before:transition-all
    before:duration-700

    hover:text-white
    before:hover:left-0
    before:hover:w-full
    before:hover:scale-150
    before:hover:duration-700

    dark:border-slate-700
    dark:bg-slate-900
    dark:text-white
  "
>
  View all campaigns

  <svg
    className="
      h-8 w-8
      rotate-45
      rounded-full
      border border-gray-700
      p-2
      transition-all
      duration-300
      ease-linear

      group-hover:rotate-90
      group-hover:border-transparent
      group-hover:bg-gray-50
    "
    viewBox="0 0 16 19"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
      className="fill-gray-800"
    />
  </svg>
</button>
          </div>

          {loadingActive ? (
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="h-96 rounded-[32px] bg-slate-200 dark:bg-slate-800 animate-pulse"
                />
              ))}
            </div>
          ) : activeCampaigns && activeCampaigns.length > 0 ? (
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {activeCampaigns.slice(0, 4).map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[32px] border border-slate-200 bg-slate-50 p-10 text-center dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">No campaigns found</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">There are no active campaigns available right now.</p>
              <button
                onClick={() => router.push("/create-campaign")}
                className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
              >
                Start a campaign
              </button>
            </div>
          )}
        </section>

        <section className="mt-10 rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/30 dark:border-slate-800 dark:bg-slate-950 dark:text-white">
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
