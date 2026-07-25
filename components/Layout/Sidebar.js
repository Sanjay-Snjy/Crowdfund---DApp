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
    <div className="fixed bottom-6 left-20 z-[90] w-full max-w-sm rounded-[24px] border border-slate-200/70 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900/95">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Wallet</p>
        <button
          type="button"
          onClick={() => setIsWalletOpen(false)}
          className="rounded-full p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
        >
          ✕
        </button>
      </div>

        {!isConnected ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">Wallet not connected</p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
              {openConnectModal ? (
                <button
                  type="button"
                  onClick={() => openConnectModal()}
                  className="w-full rounded-2xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="text-sm text-slate-500 dark:text-slate-400">Connect wallet unavailable</div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Balance</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                {formattedBalance || "0 ETH"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Address</p>
              <div className="mt-1 flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 dark:bg-slate-800">
                <span className="truncate text-sm text-slate-700 dark:text-slate-200">
                  {shortenedAddress || "No address"}
                </span>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="ml-auto rounded-full p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                  title="Copy address"
                >
                  {copied ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Network</p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                {networkLabel}
              </p>
              {networkDetail && (
                <p className="text-xs text-slate-500 dark:text-slate-400">{networkDetail}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => disconnect()}
              className="w-full rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400"
            >
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>
  );

  const profilePanel = (
    <div className="fixed bottom-6 left-20 z-[90] w-full max-w-sm rounded-[24px] border border-slate-200/70 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900/95">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Profile</p>
        <button
          type="button"
          onClick={() => setIsProfileOpen(false)}
          className="rounded-full p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
        >
          ✕
        </button>
      </div>
      <div className="mt-4 space-y-4">
        <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-3 dark:bg-slate-800">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt="Profile"
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200">
              <FiUser className="h-6 w-6" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{userFullName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{userEmail}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => openUserProfile?.()}
          className="w-full rounded-2xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed top-[86px] h-[86.5%] left-3 bg-[#e6e6e6]/60 backdrop-blur-md dark:bg-darkb border border-secondary dark:border-gray-450 z-40 transition-all duration-300 ease-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        w-16
        md:translate-x-0 rounded-3xl overflow-y-auto flex flex-col
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
              <div key={item.id} className="relative flex items-center justify-center overflow-visible group">
                <Link
                  href={item.path}
                className={`
                  flex items-center justify-center px-3 py-3 rounded-4xl transition-all duration-300
                  ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-600"
                      : "text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }
                `}
                title={item.label}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
                <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-slate-950 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-1 dark:bg-slate-200 dark:text-slate-950">
                  {tooltip}
                </span>
              </div>
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

        <div className="mt-auto border-t border-gray-200/80 p-2 dark:border-gray-700/80">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center">
              <div className="group relative overflow-visible">
                <button
                  type="button"
                  onClick={openWalletPanel}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition ${
                    isWalletOpen
                      ? "border-blue-600 bg-blue-50 text-blue-600 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-400"
                      : "border-gray-300 bg-white text-gray-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-100 dark:hover:border-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                  }`}
                  title="Wallet"
                >
                  <FiCreditCard className="h-5 w-5" />
                </button>
                <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-slate-950 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-1 dark:bg-slate-200 dark:text-slate-950">
                  Wallet
                </span>
                {mounted && isWalletOpen && createPortal(walletPanel, document.body)}
              </div>
            </div>
              <div className="flex items-center justify-center">
              <div className="group relative flex items-center justify-center overflow-visible">
                {isSignedIn ? (
                  <button
                    type="button"
                    onClick={openProfilePanel}
                    className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-100 dark:hover:border-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                    title="Profile"
                  >
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <FiUser className="h-5 w-5" />
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => window.location.assign("/sign-in")}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-100 dark:hover:border-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                    title="Profile"
                  >
                    <FiUser className="h-5 w-5" />
                  </button>
                )}
                <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-slate-950 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-1 dark:bg-slate-200 dark:text-slate-950">
                  Profile
                </span>
                {mounted && isProfileOpen && createPortal(profilePanel, document.body)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
