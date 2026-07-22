import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = "blue",
}) {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-500/20",
    green: "from-emerald-500 to-teal-500",
    purple: "from-violet-500 to-fuchsia-500",
    orange: "from-orange-400 to-amber-500",
    pink: "from-fuchsia-500 to-pink-500",
    indigo: "from-indigo-500 to-sky-500",
    red: "from-rose-500 to-pink-600",
    teal: "from-teal-500 to-cyan-500",
  };

  return (
    <div className="bg-[#e6e6e6]/60 backdrop-blur-sm dark:bg-darkb rounded-2xl p-6 border border-secondary dark:border-gray-450">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-200 text-sm font-medium">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>

          {trend && (
            <div className="flex items-center mt-2">
              {trend === "up" ? (
                <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <FiTrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span
                className={`text-sm font-medium ${
                  trend === "up" ? "text-green-500" : "text-red-500"
                }`}
              >
                {trendValue}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
                vs last month
              </span>
            </div>
          )}
        </div>

        <div
          className={`w-12 h-12 bg-gradient-to-r ${colorClasses[color]} rounded-2xl flex items-center justify-center`}
        >
          <Icon className="w-8 h-8 text-blue-900 dark:text-white" />
        </div>
      </div>
    </div>
  );
}
