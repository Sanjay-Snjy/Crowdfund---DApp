import { useState, useEffect } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { FiUser, FiClock, FiTarget, FiTrendingUp } from "react-icons/fi";
import {
  formatEther,
  formatAddress,
  calculateTimeLeft,
  calculateProgress,
} from "../../utils/helpers";
import { getFromIPFS } from "../../utils/ipfs";

export default function CampaignCard({ campaign, className = "", isLandingCard = false, viewMode = "grid" }) {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (campaign.metadataHash) {
        const result = await getFromIPFS(campaign.metadataHash);
        if (result.success) {
          setMetadata(result.data);
        }
      }
      setLoading(false);
    };

    fetchMetadata();
  }, [campaign.metadataHash]);

  const progress = calculateProgress(
    campaign.raisedAmount,
    campaign.targetAmount
  );
  const timeLeft = calculateTimeLeft(campaign.deadline);
  const raisedAmount = formatEther(campaign.raisedAmount);
  const targetAmount = formatEther(campaign.targetAmount);

  return (
    <div
      className={`bg-white border border-slate-200 shadow-lg shadow-slate-200/40 rounded-[32px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:bg-slate-950 dark:border-slate-800 dark:shadow-none ${
        viewMode === "list"
          ? "flex flex-col gap-6 md:flex-row md:items-center"
          : ""
      } ${className}`}
    >
      <div className={`relative overflow-hidden ${viewMode === "list" ? "md:w-1/3" : ""}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-slate-700 to-slate-950 opacity-20" />
        {metadata?.image ? (
          <img
            src={metadata.image}
            alt={campaign.title}
            className="h-56 w-full object-cover transition-transform duration-500 ease-out hover:scale-105"
          />
        ) : (
          <div className="flex h-56 items-center justify-center bg-slate-100 text-6xl font-bold text-slate-300 dark:bg-slate-900 dark:text-slate-600">
            {campaign.title?.charAt(0) || "C"}
          </div>
        )}

        {!isLandingCard && (
          <div className="absolute inset-x-0 top-4 flex items-center justify-between px-4">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${
                campaign.active
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200"
              }`}
            >
              {campaign.active ? "Active" : "Inactive"}
            </span>
            {!timeLeft.expired && (
              <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                <FiClock className="inline h-3 w-3 mr-1" />
                {timeLeft.text}
              </span>
            )}
          </div>
        )}
      </div>

      <div className={`p-6 ${viewMode === "list" ? "md:w-2/3" : ""}`}>
        <div className="mb-4">
          <h3 className={`text-xl font-semibold tracking-tight ${isLandingCard ? "text-white" : "text-slate-950 dark:text-white"}`}>
            {campaign.title}
          </h3>
          {!isLandingCard && (
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400 line-clamp-3">
              {campaign.description}
            </p>
          )}
        </div>

        {!isLandingCard && (
          <>
            <div className="mb-5 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <FiUser className="h-4 w-4" />
                <span>by {formatAddress(campaign.creator)}</span>
              </div>
            </div>

            <div className="mb-5 rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-3">
                <span>Funding progress</span>
                <span>{Math.min(progress, 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-slate-500 dark:text-slate-400">Raised</p>
                <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                  {parseFloat(raisedAmount).toFixed(2)} ETH
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-slate-500 dark:text-slate-400">Target</p>
                <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                  {parseFloat(targetAmount).toFixed(2)} ETH
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-6">
              <span>{campaign.contributorsCount || 0} contributors</span>
              {timeLeft.expired && (
                <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700 dark:bg-rose-900 dark:text-rose-200">
                  Expired
                </span>
              )}
            </div>
          </>
        )}

        {isLandingCard ? (
          <>
            <SignedIn>
              <Link href={`/campaign/${campaign.id}`}>
                <button className="w-full rounded-3xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.01]">
                  View Details
                </button>
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="w-full rounded-3xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.01]">
                  View Details
                </button>
              </SignInButton>
            </SignedOut>
          </>
        ) : (
          <Link href={`/campaign/${campaign.id}`}>
            <button className="w-full rounded-3xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.01]">
              View Details
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
