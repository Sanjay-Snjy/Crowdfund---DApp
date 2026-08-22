import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAccount, useBalance, useDisconnect, useNetwork } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  FiHome,
  FiGrid,
  FiList,
  FiPlus,
  FiUser,
  FiHeart,
  FiSettings,
  FiTrendingUp,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiCreditCard,
  FiCopy,
  FiCheck,
} from "react-icons/fi";
import { SIDEBAR_ITEMS } from "../../constants";

const iconMap = {
  FiHome,
  FiGrid,
  FiList,
  FiPlus,
  FiUser,
  FiHeart,
  FiSettings,
  FiTrendingUp,
};

const tooltipMap = {
  FiMenu: "Menu",
  FiTrendingUp: "Explore Campaigns",
  FiGrid: "Dashboard",
  FiPlus: "Create Campaign",
  FiHeart: "Saved Campaigns",
  FiSettings: "Settings",
  FiUser: "Profile",
  FiCreditCard: "Wallet",
};

export default function Sidebar({
  isOpen,
  onToggle,
  isCollapsed,
  onToggleCollapse,
}) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const { data: balanceData } = useBalance({ address });
  const { isSignedIn, user } = useUser();
  const { openUserProfile } = useClerk();
  const { openConnectModal } = useConnectModal();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Check if user is admin (you can implement your admin check logic here)
    // For now, we'll use a simple check or environment variable
    const adminAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;
    setIsAdmin(address?.toLowerCase() === adminAddress?.toLowerCase());
  }, [address]);

  const filteredItems = SIDEBAR_ITEMS.filter(
    (item) => !item.adminOnly || (item.adminOnly && isAdmin)
  );

  useEffect(() => {
    if (!isWalletOpen && !isProfileOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsWalletOpen(false);
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isWalletOpen, isProfileOpen]);

  const formattedBalance = balanceData?.formatted
    ? `${Number(balanceData.formatted).toFixed(3)} ${balanceData.symbol}`
    : null;
  const shortenedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;
  const networkLabel = chain?.name || (isConnected ? "Unknown network" : "Not connected");
  const networkDetail = chain?.id ? `Chain ID ${chain.id}` : null;

  const sidebarWidthClass = isOpen
    ? `w-64 ${isCollapsed ? "md:w-16" : "md:w-56"}`
    : `w-16 ${isCollapsed ? "md:w-16" : "md:w-56"}`;

  const handleCopyAddress = async () => {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy address", error);
    }
  };

  const openWalletPanel = () => {
    setIsProfileOpen(false);
    setIsWalletOpen((prev) => !prev);
  };

  const openProfilePanel = () => {
    setIsWalletOpen(false);
    setIsProfileOpen((prev) => !prev);
  };

  const userFullName = user?.fullName || user?.firstName || "Profile";
  const userEmail =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    user?.emailAddress ||
    "No email";

  const walletPanel = (
    <div className="fixed bottom-0 left-0 right-0 md:bottom-6 md:left-20 md:right-auto z-[90] w-full md:max-w-sm rounded-t-3xl md:rounded-[24px] border border-slate-200/70 bg-white p-4 shadow-2xl dark:border-navy-600 dark:bg-navy-400/95">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">Wallet</p>
        <button
          type="button"
          onClick={() => setIsWalletOpen(false)}
          className="rounded-full p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:text-[#CBD5E1] dark:hover:bg-navy-500 dark:hover:text-[#F8FAFC]"
        >
          ✕
        </button>
      </div>

        {!isConnected ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-slate-500 dark:text-[#94A3B8]">Wallet not connected</p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-navy-600 dark:bg-navy-500">
              {openConnectModal ? (
                <button
                  type="button"
                  onClick={() => openConnectModal()}
                  className="w-full rounded-2xl bg-indigo-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="text-sm text-slate-500 dark:text-[#94A3B8]">Connect wallet unavailable</div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-[#94A3B8]">Balance</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-[#F8FAFC]">
                {formattedBalance || "0 ETH"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-[#94A3B8]">Address</p>
              <div className="mt-1 flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 dark:bg-navy-500">
                <span className="truncate text-sm text-slate-700 dark:text-[#CBD5E1]">
                  {shortenedAddress || "No address"}
                </span>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="ml-auto rounded-full p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:text-[#CBD5E1] dark:hover:bg-navy-500 dark:hover:text-[#F8FAFC]"
                  title="Copy address"
                >
                  {copied ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-[#94A3B8]">Network</p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-[#F8FAFC]">
                {networkLabel}
              </p>
              {networkDetail && (
                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">{networkDetail}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => disconnect()}
              className="w-full rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 dark:border-red-900/30 dark:bg-[rgba(239,68,68,0.10)] dark:text-[#EF4444]"
            >
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>
  );

  const profilePanel = (
    <div className="fixed bottom-0 left-0 right-0 md:bottom-6 md:left-20 md:right-auto z-[90] w-full md:max-w-sm rounded-t-3xl md:rounded-[24px] border border-slate-200/70 bg-white p-4 shadow-2xl dark:border-navy-600 dark:bg-navy-400/95">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">Profile</p>
        <button
          type="button"
          onClick={() => setIsProfileOpen(false)}
          className="rounded-full p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:text-[#CBD5E1] dark:hover:bg-navy-500 dark:hover:text-[#F8FAFC]"
        >
          ✕
        </button>
      </div>
      <div className="mt-4 space-y-4">
        <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-3 dark:bg-navy-500">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt="Profile"
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-navy-600 dark:text-[#CBD5E1]">
              <FiUser className="h-6 w-6" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">{userFullName}</p>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">{userEmail}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => openUserProfile?.()}
          className="w-full rounded-2xl bg-indigo-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600"
        >
          Manage profile
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 bottom-0 left-0 md:top-[86px] md:bottom-6 md:left-3 bg-[#e6e6e6]/95 backdrop-blur-md dark:bg-navy-100 border-0 md:border border-secondary dark:border-navy-600 z-40 transition-all duration-300 ease-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${sidebarWidthClass}
        rounded-none md:rounded-3xl overflow-y-auto overflow-x-hidden flex flex-col
      `}
      >
        {/* Header */}
        <div className="m-1 p-0 rounded-3xl" />

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-2">
          {filteredItems.map((item) => {
            const Icon = iconMap[item.icon];
            const tooltip = tooltipMap[item.icon] || item.label;
            const isActive = router.pathname === item.path;

            return (
              <div key={item.id} className={`relative flex items-center overflow-visible group ${isCollapsed ? "justify-center" : "justify-start"}`}>
                <Link
                  href={item.path}
                className={`
                  flex items-center px-3 py-3 rounded-4xl transition-all duration-300 w-full
                  ${isCollapsed ? "justify-center" : "justify-start gap-3"}
                  ${
                    isActive
                      ? "bg-indigo-500/10 dark:bg-[rgba(99,102,241,0.14)] text-indigo-500 dark:text-[#A5B4FC] border border-indigo-500 dark:border-indigo-500"
                      : "text-gray-700 dark:text-[#CBD5E1] hover:bg-gray-50 dark:hover:bg-navy-500"
                  }
                `}
                title={item.label}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </Link>
                <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-slate-950 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-1 dark:bg-slate-200 dark:text-slate-950">
                  {tooltip}
                </span>
              </div>
            );
          })}
        </nav>

        <div className="px-2 py-2 hidden md:block">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex w-full items-center justify-center gap-2 rounded-3xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-navy-600 dark:bg-navy-500 dark:text-slate-100 dark:hover:bg-navy-500"
          >
            <FiChevronLeft
              className={`h-4 w-4 transition-transform ${isCollapsed ? "-rotate-180" : "rotate-0"}`}
            />
            {!isCollapsed && "Collapse"}
          </button>
        </div>

        {/* Connection Status */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-navy-600 hidden md:block">
            <div
              className={`
              flex items-center space-x-2 px-3 py-2 rounded-2xl
              ${
                isConnected
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                  : "bg-red-50 dark:bg-[rgba(239,68,68,0.10)] text-red-700 dark:text-[#EF4444]"
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
              <div className="mt-2 text-xs text-gray-500 dark:text-[#94A3B8] px-3">
                {address.slice(0, 6)}...{address.slice(-4)}
              </div>
            )}
          </div>
        )}

        <div className="mt-auto border-t border-gray-200/80 p-2 dark:border-navy-600/80">
          <div className="flex flex-col gap-1">
            {/* Wallet button */}
            <div className="relative overflow-visible">
              <button
                type="button"
                onClick={openWalletPanel}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                  isCollapsed ? "justify-center" : "justify-start ml-2"
                } ${
                  isWalletOpen
                    ? "bg-indigo-500/10 text-indigo-500 dark:bg-[rgba(99,102,241,0.14)] dark:text-[#A5B4FC]"
                    : "text-gray-700 hover:bg-gray-50 dark:text-[#CBD5E1] dark:hover:bg-navy-500 "
                }`}
                title="Your Wallet"
              >
                <FiCreditCard className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">Your Wallet</span>}
              </button>
              {isCollapsed && (
                <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-slate-950 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-1 dark:bg-slate-200 dark:text-slate-950">
                  Your Wallet
                </span>
              )}
              {mounted && isWalletOpen && createPortal(walletPanel, document.body)}
            </div>

            {/* Profile button */}
            <div className="relative overflow-visible">
              {isSignedIn ? (
                <button
                  type="button"
                  onClick={openProfilePanel}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                    isCollapsed ? "justify-center" : "justify-start"
                  } text-gray-700 hover:bg-gray-50 dark:text-[#CBD5E1] dark:hover:bg-navy-500`}
                  title={userFullName || "User Profile"}
                >
                  <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <FiUser className="h-5 w-5" />
                    )}
                  </div>
                  {!isCollapsed && <span className="truncate">{userFullName || "User Profile"}</span>}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => window.location.assign("/sign-in")}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                    isCollapsed ? "justify-center" : "justify-start"
                  } text-gray-700 hover:bg-gray-50 dark:text-[#CBD5E1] dark:hover:bg-navy-500`}
                  title="User Profile"
                >
                  <FiUser className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="truncate">User Profile</span>}
                </button>
              )}
              {mounted && isProfileOpen && createPortal(profilePanel, document.body)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
