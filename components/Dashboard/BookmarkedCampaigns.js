import { useState, useEffect, useCallback, useMemo } from "react";
import { FiBookmark, FiExternalLink, FiTrash2 } from "react-icons/fi";
import { useRouter } from "next/router";
import { useContract } from "../../hooks/useContract";
import { formatEther } from "../../utils/helpers";

const STORAGE_KEY = "crowdfund_bookmarks";

function readBookmarks() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function BookmarkedCampaigns() {
  const [bookmarkIds, setBookmarkIds] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  const { useMultipleCampaigns } = useContract();

  // Convert string IDs to numbers.
  // Memoized so the array keeps a stable identity across renders — passing a new
  // array reference into useMultipleCampaigns re-triggers its internal effect on
  // every render, which causes an endless render loop that blocks route changes.
  const numericIds = useMemo(
    () => bookmarkIds.map((id) => Number(id)).filter((n) => !isNaN(n) && n > 0),
    [bookmarkIds]
  );

  const { campaigns, loading } = useMultipleCampaigns(numericIds);

  // Load bookmarks on mount and listen for changes
  useEffect(() => {
    setBookmarkIds(readBookmarks());
    setLoaded(true);

    // Only replace state when the stored ids actually changed, so the 2s poll
    // below does not hand a fresh array identity to downstream hooks on every tick.
    const onChange = () =>
      setBookmarkIds((prev) => {
        const next = readBookmarks();
        const same =
          prev.length === next.length &&
          prev.every((v, i) => String(v) === String(next[i]));
        return same ? prev : next;
      });
    window.addEventListener("bookmarksChanged", onChange);
    const poll = setInterval(onChange, 2000);
    return () => {
      window.removeEventListener("bookmarksChanged", onChange);
      clearInterval(poll);
    };
  }, []);

  // Client-side transition. window.location.href would force a full page reload.
  const goToCampaign = useCallback(
    (id) => {
      router.push(`/campaign/${id}`);
    },
    [router]
  );

  const removeBookmark = useCallback(
    (e, id) => {
      e.preventDefault();
      e.stopPropagation();
      const idStr = String(id);
      const next = bookmarkIds.filter((b) => String(b) !== idStr);
      setBookmarkIds(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("bookmarksChanged"));
    },
    [bookmarkIds]
  );

  if (!loaded) return null;

  // Empty state
  if (!bookmarkIds.length) {
    return (
      <div className="card p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-3">
          <FiBookmark className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Saved Campaigns</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-6">
          <FiBookmark className="w-6 h-6 mb-2" style={{ color: "var(--color-text-muted)" }} />
          <p className="text-xs text-center" style={{ color: "var(--color-text-muted)" }}>
            Bookmark campaigns from All Campaigns to see them here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 rounded-2xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FiBookmark className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
            Saved Campaigns
            <span className="ml-1.5 text-xs font-normal" style={{ color: "var(--color-text-muted)" }}>
              ({bookmarkIds.length})
            </span>
          </h3>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-10" />
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          {campaigns.map((c) => {
            const id = Number(c.id?.toString?.() || c.id);
            const raised = parseFloat(formatEther(c.raisedAmount || 0));
            const target = parseFloat(formatEther(c.targetAmount || 0));
            const pct = target > 0 ? Math.min((raised / target) * 100, 100) : 0;

            return (
              <div
                key={id}
                role="button"
                tabIndex={0}
                className="flex items-center gap-2 p-2 rounded-lg transition group"
                style={{ background: "var(--color-surface)", cursor: "pointer" }}
                onClick={() => goToCampaign(id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") goToCampaign(id);
                }}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-medium truncate"
                    style={{ color: "var(--color-text)" }}
                  >
                    {c.title || `Campaign #${id}`}
                  </p>
                  <p
                    className="text-[10px] mt-0.5"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {raised.toFixed(2)} / {target.toFixed(2)} ETH ({pct.toFixed(0)}%)
                  </p>
                </div>

                <FiExternalLink
                  className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition"
                  style={{ color: "var(--color-text-muted)" }}
                />

                <button
                  type="button"
                  onClick={(e) => removeBookmark(e, id)}
                  className="p-1 rounded-md opacity-0 group-hover:opacity-100 transition hover:bg-red-500/10"
                  title="Remove bookmark"
                >
                  <FiTrash2 className="w-3 h-3 text-red-400" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
