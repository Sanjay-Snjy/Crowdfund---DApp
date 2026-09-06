import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { FiClock, FiBookmark, FiShare2 } from "react-icons/fi";
import { formatEther, calculateTimeLeft, calculateProgress, getCreatorDisplayName } from "../../utils/helpers";
import { getFromIPFS } from "../../utils/ipfs";
import { useBookmarks } from "../../hooks/useBookmarks";
import { toast } from "react-hot-toast";

export default function CampaignCard({
  campaign,
  creatorProfile = null,
  currentUserAddress = null,
  currentUserName = "",
  className = "",
  viewMode = "grid",
  metadata: metadataProp,
}) {
  const [metadata, setMetadata] = useState(metadataProp || null);
  const [imgError, setImgError] = useState(false);
  const { toggle, isBookmarked } = useBookmarks();

  useEffect(() => {
    if (metadataProp) { setMetadata(metadataProp); return; }
    if (!campaign?.metadataHash) return;
    let cancelled = false;
    getFromIPFS(campaign.metadataHash).then((res) => {
      if (!cancelled && res.success) setMetadata(res.data);
    });
    return () => { cancelled = true; };
  }, [campaign?.metadataHash, metadataProp]);

  const progress = calculateProgress(campaign.raisedAmount, campaign.targetAmount);
  const timeLeft = calculateTimeLeft(campaign.deadline);
  const raised = parseFloat(formatEther(campaign.raisedAmount)).toFixed(2);
  const target = parseFloat(formatEther(campaign.targetAmount)).toFixed(2);
  const creatorName = getCreatorDisplayName(campaign.creator, metadata?.creator, creatorProfile, currentUserAddress, currentUserName);
  const id = campaign.id?.toString?.();
  const bookmarked = isBookmarked(id);

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(id);
    toast.success(bookmarked ? "Removed from saved" : "Saved to bookmarks");
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/campaign/${id}`);
    toast.success("Link copied!");
  };

  const isListView = viewMode === "list";

  return (
    <div
      className={`card card-hover overflow-hidden ${isListView ? "flex flex-col sm:flex-row" : "flex flex-col"} ${className}`}
    >
      {/* Image */}
      <div className={`relative shrink-0 ${isListView ? "sm:w-48 h-36 sm:h-auto" : "h-44"}`}>
        {metadata?.image && !imgError ? (
          <img
            src={metadata.image}
            alt={campaign.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--color-surface-raised)" }}>
            <span className="text-3xl font-bold" style={{ color: "var(--color-text-muted)" }}>
              {campaign.title?.charAt(0) || "C"}
            </span>
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span className={`badge ${campaign.active ? "badge-success" : "badge-error"}`}>
            {campaign.active ? "Active" : "Ended"}
          </span>
        </div>
        {/* Bookmark + Share */}
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={handleBookmark}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
              bookmarked ? "bg-indigo-600 text-white" : "bg-black/60 text-white hover:bg-black"
            }`}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
          >
            <FiBookmark className="w-3.5 h-3.5" fill={bookmarked ? "currentColor" : "none"} />
          </button>
          <button
            onClick={handleShare}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-black/60 text-white hover:bg-black transition-colors"
            aria-label="Share"
          >
            <FiShare2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <Link href={`/campaign/${id}`} className="block group">
          <h3 className="text-sm font-semibold line-clamp-2 group-hover:underline" style={{ color: "var(--color-text)" }}>
            {campaign.title}
          </h3>
        </Link>
        <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
          by {creatorName}
        </p>

        {/* Progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span style={{ color: "var(--color-text-secondary)" }}>
              <span className="font-semibold" style={{ color: "var(--color-text)" }}>{raised}</span> / {target} ETH
            </span>
            <span className="font-medium" style={{ color: "var(--color-accent)" }}>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-surface-raised)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%`, background: "var(--color-accent)" }}
            />
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-3 flex items-center justify-between text-xs" style={{ color: "var(--color-text-muted)" }}>
          <span className="flex items-center gap-1">
            {!timeLeft.expired && <FiClock className="w-3 h-3" />}
            {timeLeft.expired ? "Expired" : timeLeft.text}
          </span>
          <span>{campaign.contributorsCount || 0} backers</span>
        </div>

        {/* CTA */}
        <Link
          href={`/campaign/${id}`}
          className="mt-auto bg-cyan-600/80  btn btn-sm w-full text-center"
        >
          View Campaign
        </Link>
      </div>
    </div>
  );
}
