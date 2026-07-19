import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";
import { FiMenu, FiSun, FiMoon, FiBell, FiSearch } from "react-icons/fi";

export default function Header({ onMenuToggle, isCollapsed }) {
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [walletUserName, setWalletUserName] = useState("");
  const [linkedWalletAddress, setLinkedWalletAddress] = useState(null);
  const [walletStatusMessage, setWalletStatusMessage] = useState("");
  const [walletStatusError, setWalletStatusError] = useState("");
  const [isLinkingWallet, setIsLinkingWallet] = useState(false);
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const shouldUseDark = savedTheme
      ? savedTheme === "dark"
      : prefersDark;

    setIsDark(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
    document.documentElement.style.colorScheme = shouldUseDark ? "dark" : "light";

    if (!savedTheme) {
      window.localStorage.setItem("theme", shouldUseDark ? "dark" : "light");
    }
  }, [router.pathname]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) {
      setWalletUserName("");
      setLinkedWalletAddress(null);
      setWalletStatusMessage("");
      setWalletStatusError("");
      return;
    }

    const fallbackName =
      user.fullName ||
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
      "Signed In";

    setWalletUserName(fallbackName);
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    const loadWalletLink = async () => {
      if (!isLoaded || !isSignedIn || !user?.id) {
        setLinkedWalletAddress(null);
        setWalletStatusMessage("");
        setWalletStatusError("");
        return;
      }

      try {
        const response = await fetch(
          `/api/wallet-link?clerkUserId=${encodeURIComponent(user.id)}`
        );
        const data = await response.json();

        if (data?.walletAddress) {
          setLinkedWalletAddress(data.walletAddress);

          if (!address || !isConnected) {
            setWalletStatusMessage("Connect MetaMask to continue");
            setWalletStatusError("");
            return;
          }

          const connected = address.toLowerCase();
          const linked = data.walletAddress.toLowerCase();
          if (connected === linked) {
            setWalletStatusMessage("Wallet verified");
            setWalletStatusError("");
          } else {
            setWalletStatusMessage("Wallet mismatch");
            setWalletStatusError(
              `Linked wallet ${data.walletAddress.slice(0, 6)}...${data.walletAddress.slice(-4)} does not match the currently connected account.`
            );
          }
        } else {
          setLinkedWalletAddress(null);
          if (isConnected && address) {
            setWalletStatusMessage("Connect MetaMask and verify your wallet");
            setWalletStatusError("");
          } else {
            setWalletStatusMessage("");
            setWalletStatusError("");
          }
        }
      } catch (error) {
        console.error("Error loading wallet link state", error);
      }
    };

    loadWalletLink();
  }, [address, isConnected, isLoaded, isSignedIn, user?.id]);

  const handleWalletLink = async () => {
    if (!isLoaded || !isSignedIn || !user?.id || !address) {
      setWalletStatusError("Please sign in and connect MetaMask first.");
      return;
    }

    setIsLinkingWallet(true);
    setWalletStatusError("");

    try {
      const initResponse = await fetch("/api/wallet-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "init",
          clerkUserId: user.id,
          walletAddress: address,
          name:
            user.fullName ||
            [user.firstName, user.lastName].filter(Boolean).join(" ") ||
            user.username ||
            user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
            "Signed In",
          email: user.primaryEmailAddress?.emailAddress || "",
        }),
      });
      const initData = await initResponse.json();

      if (!initResponse.ok || !initData?.nonce) {
        throw new Error(initData?.error || "Unable to start wallet verification.");
      }

      const signature = await signMessageAsync({
        message: initData.nonce,
      });

      const verifyResponse = await fetch("/api/wallet-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          clerkUserId: user.id,
          walletAddress: address,
          nonce: initData.nonce,
          signature,
          name:
            user.fullName ||
            [user.firstName, user.lastName].filter(Boolean).join(" ") ||
            user.username ||
            user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
            "Signed In",
          email: user.primaryEmailAddress?.emailAddress || "",
        }),
      });
      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData?.success) {
        throw new Error(verifyData?.error || "Wallet verification failed.");
      }

      setLinkedWalletAddress(address);
      setWalletStatusMessage("Wallet linked successfully");
      setWalletStatusError("");
    } catch (error) {
      setWalletStatusError(error.message || "Wallet verification failed.");
    } finally {
      setIsLinkingWallet(false);
    }
  };

  const toggleTheme = () => {
    setIsDark((prev) => {
      const nextIsDark = !prev;
      document.documentElement.classList.toggle("dark", nextIsDark);
      document.documentElement.style.colorScheme = nextIsDark ? "dark" : "light";
      localStorage.setItem("theme", nextIsDark ? "dark" : "light");
      return nextIsDark;
    });
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
          {walletUserName && (
            <div className="hidden sm:flex items-center rounded-4xl border border-gray-300 bg-white/70 px-3 py-1.5 text-sm font-medium text-gray-700 dark:border-gray-600 dark:bg-darkb/70 dark:text-gray-200">
              {walletUserName}
            </div>
          )}

          {isConnected && address && (
            <div className="hidden md:flex items-center rounded-4xl border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300">
              {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          )}

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
