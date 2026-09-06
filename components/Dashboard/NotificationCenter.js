import { useState, useRef, useEffect, useMemo } from "react";
import { FiBell, FiArrowUpRight, FiClock, FiFlag, FiCheck } from "react-icons/fi";
import { formatEther, formatDate } from "../../utils/helpers";

export default function NotificationCenter({ userCampaigns, userContributions, transactionFeed }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  // Build notifications from real data
  const notifications = useMemo(() => {
    const items = [];

    // Contribution notifications from transaction feed
    if (transactionFeed?.length) {
      transactionFeed.forEach((tx) => {
        items.push({
          id: `tx-${tx.campaignId}-${tx.timestamp}`,
          type: "contribution",
          icon: FiArrowUpRight,
          title: `New contribution to ${tx.campaignTitle}`,
          detail: `${parseFloat(formatEther(tx.amount)).toFixed(4)} ETH`,
          time: tx.timestamp,
          unread: true,
        });
      });
    }

    // Deadline approaching notifications
    if (userCampaigns?.length) {
      userCampaigns.forEach((c) => {
        if (!c?.active) return;
        const deadline = Number(c.deadline?.toString?.() || 0) * 1000;
        const now = Date.now();
        const daysLeft = (deadline - now) / (1000 * 60 * 60 * 24);
        if (daysLeft > 0 && daysLeft <= 7) {
          items.push({
            id: `deadline-${c.id}`,
            type: "deadline",
            icon: FiClock,
            title: `${c.title || `Campaign #${c.id}`} ends soon`,
            detail: `${Math.ceil(daysLeft)} day${Math.ceil(daysLeft) !== 1 ? "s" : ""} left`,
            time: Math.floor(deadline / 1000),
            unread: daysLeft <= 3,
          });
        }
        if (daysLeft < 0) {
          items.push({
            id: `ended-${c.id}`,
            type: "ended",
            icon: FiCheck,
            title: `${c.title || `Campaign #${c.id}`} has ended`,
            detail: "Campaign deadline passed",
            time: Math.floor(deadline / 1000),
            unread: false,
          });
        }
      });
    }

    return items
      .sort((a, b) => (b.time || 0) - (a.time || 0))
      .slice(0, 12);
  }, [userCampaigns, transactionFeed]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const typeColors = {
    contribution: { bg: "rgba(99,102,241,0.12)", color: "#818cf8" },
    deadline: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24" },
    ended: { bg: "rgba(34,197,94,0.12)", color: "#22c55e" },
    milestone: { bg: "rgba(6,182,212,0.12)", color: "#06b6d4" },
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-9 h-9 rounded-2xl transition backdrop-blur-sm border border-black/10"
        style={{ background: isOpen ? "var(--color-surface)" : "transparent", color: "var(--color-text-muted)" }}
      >
        <FiBell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-80 max-h-[420px] overflow-y-auto rounded-xl border shadow-2xl z-50"
          style={{
            background: "var(--color-surface-raised, var(--color-card))",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--color-border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Notifications</p>
            {unreadCount > 0 && (
              <span className="text-xs font-medium" style={{ color: "var(--color-accent)" }}>
                {unreadCount} unread
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <FiBell className="w-6 h-6 mx-auto mb-2" style={{ color: "var(--color-text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map((n) => {
                const Icon = n.icon;
                const colors = typeColors[n.type] || typeColors.contribution;
                return (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 transition hover:opacity-80"
                    style={{ opacity: n.unread ? 1 : 0.6 }}
                  >
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5"
                      style={{ background: colors.bg }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: colors.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium leading-snug" style={{ color: "var(--color-text)" }}>
                        {n.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                        {n.detail}
                      </p>
                    </div>
                    {n.unread && (
                      <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: colors.color }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
