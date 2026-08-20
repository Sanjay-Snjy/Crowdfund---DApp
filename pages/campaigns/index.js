import { useState } from "react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { useUser } from "@clerk/nextjs";
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
  const { address } = useAccount();
  const { useActiveCampaigns } = useContract();
  const { user } = useUser();
  const currentUserName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "";

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
      <div className="space-y-6">
    
        <div className="rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr] xl:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search campaigns"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-12 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <div className="flex min-w-[160px] flex-1 rounded-3xl border border-slate-300 bg-slate-50 px-2 py-[5px] dark:border-slate-700 dark:bg-slate-800">
                            <select
                              value={filterStatus}
                              onChange={(e) => setFilterStatus(e.target.value)}
                              className="w-full bg-transparent text-sm text-slate-900 rounded-2xl outline-none border border-transparent dark:text-white"
                            >
                              <option value="all">All statuses</option>
                              <option value="active">Active</option>
                              <option value="funded">Funded</option>
                            </select>
                          </div>
                          <div className="flex min-w-[160px] flex-1 rounded-3xl border border-slate-300 bg-slate-50 px-2 py-[5px] dark:border-slate-700 dark:bg-slate-800">
                            <select
                              value={sortBy}
                              onChange={(e) => setSortBy(e.target.value)}
                              className="w-full bg-transparent text-sm text-slate-90 border border-transparent rounded-2xl outline-none dark:text-white"
                            >
                              <option value="newest">Newest first</option>
                              <option value="ending">Ending soon</option>
                              <option value="funded">Most funded</option>
                              <option value="popular">Most popular</option>
                            </select>
                          </div>
              <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl text-slate-600 transition ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 shadow-sm dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                <FiGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl text-slate-600 transition ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 shadow-sm dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                <FiList className="h-5 w-5" />
              </button>
            </div>
            </div>
         
          
          </div>

         
        </div>

        <div className="rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-96 animate-pulse rounded-[32px] bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          ) : sortedCampaigns.length > 0 ? (
            <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
              {sortedCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  currentUserAddress={address}
                  currentUserName={currentUserName}
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
    </Layout>
  );
}
