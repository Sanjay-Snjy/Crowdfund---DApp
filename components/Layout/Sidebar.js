import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import {
  FiHome,
  FiGrid,
  FiPlus,
  FiUser,
  FiHeart,
  FiSettings,
  FiMenu,
  FiX,
  FiChevronLeft,
} from "react-icons/fi";
import { SIDEBAR_ITEMS } from "../../constants";

const iconMap = {
  FiHome,
  FiGrid,
  FiPlus,
  FiUser,
  FiHeart,
  FiSettings,
};

export default function Sidebar({
  isOpen,
  onToggle,
  isCollapsed,
  onToggleCollapse,
}) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin (you can implement your admin check logic here)
    // For now, we'll use a simple check or environment variable
    const adminAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;
    setIsAdmin(address?.toLowerCase() === adminAddress?.toLowerCase());
  }, [address]);

  const filteredItems = SIDEBAR_ITEMS.filter(
    (item) => !item.adminOnly || (item.adminOnly && isAdmin)
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed top-2 left-2 bg-[#e6e6e6]/60  backdrop-blur-md dark:bg-darkb border border-secondary dark:border-gray-450 z-40 transition-all duration-300 ease-out 
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${isCollapsed ? "w-16" : "w-64"}
        md:translate-x-0 rounded-3xl overflow-y-auto
      `}
      >
        {/* Header */}
        <div className="m-1 flex items-center justify-between p-3 border border-secondary dark:border-gray-450 rounded-3xl ">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-4xl flex items-center justify-center">
                  <img
              src="/logo1.png"          // Place your logo in the public folder
              alt="CrowdFund Logo"
              className="w-7 h-7 object-contain"
            />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                CrowdFund Pro
              </span>
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <buttona
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FiChevronLeft
              className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
            />
          </buttona>

          {/* Mobile Close */}
          <buttona
            onClick={onToggle}
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </buttona>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-2">
          {filteredItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = router.pathname === item.path;

            return (
              <Link
                key={item.id}
                href={item.path}
                className={`
                  flex items-center space-x-3 px-4  py-3 rounded-4xl transition-all duration-300
                  ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-600"
                      : "text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }
                  ${isCollapsed ? "justify-center" : ""}
                `}
                title={isCollapsed ? item.label : ""}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Connection Status */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div
              className={`
              flex items-center space-x-2 px-3 py-2 rounded-2xl
              ${
                isConnected
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
              }
            `}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm font-medium">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>

            {isConnected && address && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 px-3">
                {address.slice(0, 6)}...{address.slice(-4)}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
