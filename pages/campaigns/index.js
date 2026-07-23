import { useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout/Layout";
import CampaignCard from "../../components/Campaign/CampaignCard";
import { useContract } from "../../hooks/useContract";
import { FiSearch, FiFilter, FiGrid, FiList } from "react-icons/fi";

export default function CampaignsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const router = useRouter();
  const { useActiveCampaigns } = useContract();
  const { data: campaigns, isLoading } = useActiveCampaigns(0, 50);

  const totalCampaigns = campaigns?.length || 0;
  const activeCampaigns =
    campaigns?.filter((campaign) => campaign.active).length || 0;
  const fundedCampaigns =
    campaigns?.filter(
      (campaign) =>
        parseFloat(campaign.raisedAmount?.toString() || "0") >=
        parseFloat(campaign.targetAmount?.toString() || "0")
    ).length || 0;

  const filteredCampaigns =
    campaigns?.filter((campaign) => {
      const searchValue = searchTerm.toLowerCase();
      const matchesSearch =
        campaign.title.toLowerCase().includes(searchValue) ||
        campaign.description.toLowerCase().includes(searchValue);

      if (filterStatus === "active") return matchesSearch && campaign.active;
      if (filterStatus === "funded")
        return (
          matchesSearch &&
          parseFloat(campaign.raisedAmount?.toString() || "0") >=
            parseFloat(campaign.targetAmount?.toString() || "0")
        );
      return matchesSearch;
    }) || [];

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    if (sortBy === "ending") {
      return (
        parseInt(a.deadline?.toString() || "0", 10) -
        parseInt(b.deadline?.toString() || "0", 10)
      );
    }
    if (sortBy === "funded") {
      return (
        parseFloat(b.raisedAmount?.toString() || "0") -
        parseFloat(a.raisedAmount?.toString() || "0")
      );
    }
    if (sortBy === "popular") {
      return (b.contributorsCount || 0) - (a.contributorsCount || 0);
    }
    const aId = parseInt(a.id?.toString() || "0", 10);
    const bId = parseInt(b.id?.toString() || "0", 10);
    return bId - aId;
  });

  return (
    <Layout>
      <div className="mx-auto max-w-8xl px-0 py-0 sm:px-0 lg:px-0">
        <div className="rounded-[32px] bg-transparent p-2  dark:border-slate-800 dark:bg-slate-950 dark:text-white">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Campaign marketplace
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[28px] border border-slate-200 bg-[#e6e6e6]/60 p-6 shadow-sm backdrop-blur-sm 0 p-4 text-center dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                Total campaigns
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
                {totalCampaigns}
              </p>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-[#e6e6e6]/60 p-6 shadow-sm backdrop-blur-sm 0 p-4 text-center dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                Active campaigns
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
                {activeCampaigns}
              </p>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-[#e6e6e6]/60 p-6 shadow-sm backdrop-blur-sm 0 p-4 text-center dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                Funded campaigns
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
                {fundedCampaigns}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-[#e6e6e6]/60 p-6 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
              <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr] xl:grid-cols-[1.2fr_0.8fr] items-center">
                <div className="relative">
                  <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search campaigns"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-3xl border border-slate-300 bg-white/90 px-12 py-3 text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3">
                  <div className="flex flex-1 min-w-[160px] rounded-3xl border border-slate-300 bg-white/90 px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-950">
                    <FiFilter className="mr-2 h-4 w-4 text-slate-500" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-900 outline-none dark:text-white"
                    >
                      <option value="all">All statuses</option>
                      <option value="active">Active</option>
                      <option value="funded">Funded</option>
                    </select>
                  </div>
                  <div className="flex flex-1 min-w-[160px] rounded-3xl border border-slate-300 bg-white/90 px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-950">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-900 outline-none dark:text-white"
                    >
                      <option value="newest">Newest First</option>
                      <option value="ending">Ending Soon</option>
                      <option value="funded">Most Funded</option>
                      <option value="popular">Most Popular</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Showing</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                    {sortedCampaigns.length} campaigns
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl text-slate-600 transition ${
                      viewMode === "grid"
                        ? "bg-blue-600 text-white"
                        : "bg-white shadow-sm dark:bg-slate-950 dark:text-slate-300"
                    }`}
                  >
                    <FiGrid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl text-slate-600 transition ${
                      viewMode === "list"
                        ? "bg-blue-600 text-white"
                        : "bg-white shadow-sm dark:bg-slate-950 dark:text-slate-300"
                    }`}
                  >
                    <FiList className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/20 dark:border-slate-800 dark:bg-slate-950">
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {[...Array(6)].map((_, index) => (
                    <div
                      key={index}
                      className="h-96 rounded-[32px] bg-slate-200 dark:bg-slate-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : sortedCampaigns.length > 0 ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  {sortedCampaigns.map((campaign) => (
                    <CampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      viewMode={viewMode}
                      className={viewMode === "list" ? "md:flex-row" : ""}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    No campaigns match your filters
                  </h3>
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    Adjust your search or filter options to see more projects.
                  </p>
                </div>
              )}
            </div>
          </div>

         
        </div>
  
    </Layout>
  );
}
