import { formatEther } from "../../utils/helpers";

export default function FundingProgress({ campaign }) {
  const raised = parseFloat(formatEther(campaign.raisedAmount || 0));
  const target = parseFloat(formatEther(campaign.targetAmount || 0));
  const pct = target > 0 ? Math.min((raised / target) * 100, 100) : 0;
  const isFunded = raised >= target;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: "var(--color-text-muted)" }}>
          {raised.toFixed(4)} / {target.toFixed(2)} ETH
        </span>
        <span
          className="font-semibold"
          style={{ color: isFunded ? "var(--color-success)" : "var(--color-accent)" }}
        >
          {pct.toFixed(0)}%
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full"
        style={{ background: "var(--color-surface)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: isFunded
              ? "var(--color-success)"
              : "var(--color-accent)",
          }}
        />
      </div>
    </div>
  );
}
