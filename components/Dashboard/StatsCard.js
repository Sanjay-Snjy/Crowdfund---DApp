import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

export function StatsCard({ title, value, icon: Icon, trend, trendValue }) {
  return (
    <div className="card p-4 rounded-3xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>{title}</p>
          <p className="text-xl font-bold mt-1" style={{ color: "var(--color-text)" }}>{value}</p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--color-accent-light)", color: "var(--color-accent)" }}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-2 text-xs">
          {trend === "up" ? <FiTrendingUp className="w-3 h-3 text-green-500" /> : <FiTrendingDown className="w-3 h-3 text-red-500" />}
          <span className={trend === "up" ? "text-green-500" : "text-red-500"}>{trendValue}</span>
          <span style={{ color: "var(--color-text-muted)" }}>vs last month</span>
        </div>
      )}
    </div>
  );
}
