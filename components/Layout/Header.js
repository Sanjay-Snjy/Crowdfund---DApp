import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { FiMenu, FiSun, FiMoon, FiBell, FiSearch } from "react-icons/fi";

export default function Header({ onMenuToggle, isCollapsed }) {
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { address, isConnected } = useAccount();

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const isDashboardRoute = window.location.pathname === "/dashboard";
    const shouldUseDark = isDashboardRoute
      ? false
      : savedTheme === "dark" || (!savedTheme && prefersDark);

    setIsDark(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
    document.documentElement.style.colorScheme = shouldUseDark ? "dark" : "light";

    if (!savedTheme || isDashboardRoute) {
      window.localStorage.setItem("theme", shouldUseDark ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <header
      className={`
       top-2 mx-2 ml-4 z-30 bg-[#e6e6e6]/60 dark:bg-darkb border border-secondary  dark:border-gray-450 
      transition-all duration-300 rounded-3xl fixed z-50 backdrop-blur-md backdrop-saturate-150
    
    `}
      style={{
        width: isCollapsed ? "94%" : "81.5%",
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <buttona
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FiMenu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </buttona>

          {/* Search Bar */}
          <div className="hidden sm:flex items-center relative">
            <FiSearch className="absolute left-0 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="-ml-4 pl-10 pr-4 py-2 w-64 bg-gray-100 dark:bg-darkb border border-secondary dark:border-gray-500 rounded-4xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <buttona
            onClick={toggleTheme}
            className="p-2 rounded-4xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isDark ? (
              <FiSun className="w-5 h-5 text-yellow-500" />
            ) : (
              <FiMoon className="w-5 h-5 text-gray-600" />
            )}
          </buttona>

          {/* Notifications */}
          {isConnected && (
            <buttona className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <FiBell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </buttona>
          )}

          {/* Network Status */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gray-100 border border-gray-400 dark:bg-darkb rounded-4xl">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {process.env.NEXT_PUBLIC_NETWORK || "Unknown"}
            </span>
          </div>

          {/* Connect Wallet Button */}
            <ConnectButton 
              chainStatus="icon"
              accountStatus={{
                smallScreen: "avatar",
                largeScreen: "full",
              }}
              showBalance={{
                smallScreen: false,
                largeScreen: true,
              }}
            />
          
        </div>
      </div>
    </header>
  );
}
