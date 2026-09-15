import { useRouter } from "next/router";
import { FiLogOut } from "react-icons/fi";
import { setDemoMode, DEMO_USERNAME, DEMO_ETH } from "../../lib/demoMode";

export default function DemoHeader() {
  const router = useRouter();

  const handleLogout = () => {
    setDemoMode(false);
    router.push("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-secondary)] border-b md:border border-secondary dark:border-[rgba(255,255,255,0.1)] transition-all duration-300 rounded-2xl backdrop-blur-md backdrop-saturate-150 mx-2 mt-2 md:mx-2 md:mt-2">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Logo + Name */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-3 rounded-2xl transition hover:opacity-90 focus:outline-none"
        >
          <div className="w-10 h-10 rounded-4xl flex items-center justify-center">
            <img src="/logo.png" alt="CrowdFund Logo" className="w-10 h-10 object-contain" />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white hidden sm:inline">CrowdFund</span>
        </button>

        {/* Demo badge */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-indigo-300 bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse dark:bg-indigo-400" />
          {DEMO_USERNAME} &middot; {DEMO_ETH}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Mobile demo badge */}
          <span className="lg:hidden text-xs font-semibold text-indigo-700 rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
            Demo
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full border border-red-300/50 bg-red-50/80 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:border-red-400 hover:bg-red-100 dark:border-red-900/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
            title="Logout from demo"
          >
            <FiLogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
