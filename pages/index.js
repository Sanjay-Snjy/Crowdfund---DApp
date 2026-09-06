import { useRouter } from "next/router";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { useAccount, useContractRead } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect, useMemo } from "react";
import {
  FiArrowRight,
  FiTarget,
  FiUsers,
  FiShield,
  FiGlobe,
  FiDatabase,
  FiFlag,
  FiThumbsUp,
  FiClock,
  FiCheckCircle,
  FiTrendingUp,
  FiBookOpen,
  FiBriefcase,
  FiBook,
  FiHeart,
  FiZap,
  FiPenTool,
} from "react-icons/fi";
import { CONTRACT_ADDRESS } from "../constants";
import { CROWDFUNDING_ABI } from "../constants/abi";
import { useContract } from "../hooks/useContract";
import CampaignCard from "../components/Campaign/CampaignCard";
import { getFromIPFS } from "../utils/ipfs";

export default function Home() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState({
    campaignsLaunched: 0,
    fundsRaised: 0,
    contributors: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showConnectedPopup, setShowConnectedPopup] = useState(false);
  const [shouldBlinkDashboard, setShouldBlinkDashboard] = useState(false);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [isGreetingVisible, setIsGreetingVisible] = useState(true);
  const greetingPhrases = [
    "Hello",
    "Ready to Fund",
    "Support Great Ideas",
    "Discover New Campaigns",
    "Let's Build Together",
  ];
  const hasValidClerkKey =
    typeof process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === "string" &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.trim().length > 0 &&
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("your_clerk_publishable_key_here");

  // Force dark mode on landing page for correct CSS variable resolution
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  // Fetch campaign counter
  const { data: campaignCount } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CROWDFUNDING_ABI,
    functionName: "campaignCounter",
    staleTime: 30_000,
  });

  // Trigger popup and blink animation only when user explicitly connects wallet (not on page refresh)
  useEffect(() => {
    // Get previously stored connection state from localStorage
    const wasWalletConnected = localStorage.getItem("walletWasConnected") === "true";
    const isNewConnection = isConnected && !wasWalletConnected;

    if (isNewConnection) {
      // Show connected popup for 1 second
      setShowConnectedPopup(true);
      const popupTimer = setTimeout(() => setShowConnectedPopup(false), 1000);
      
      // Start dashboard button blink after popup closes (1 second delay)
      const dashboardBlinkTimer = setTimeout(() => {
        setShouldBlinkDashboard(true);
        const dashboardClearTimer = setTimeout(() => setShouldBlinkDashboard(false), 600); // Dashboard button blinks for 1.5s
        return () => clearTimeout(dashboardClearTimer);
      }, 1100); // Start 100ms after popup closes
      
      return () => {
        clearTimeout(popupTimer);
        clearTimeout(dashboardBlinkTimer);
      };
    }

    // Update localStorage with current connection state
    localStorage.setItem("walletWasConnected", isConnected.toString());
  }, [isConnected]);

  // Fetch and aggregate campaign statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!campaignCount) return;

      try {
        setLoading(true);
        const publicClient = await import("wagmi").then((m) => m.publicClient);
        let totalFunds = 0n;
        let totalContributors = 0;

        // Fetch stats for each campaign
        const campaignId = campaignCount.toNumber ? campaignCount.toNumber() : Number(campaignCount);

        for (let i = 1; i <= campaignId; i++) {
          try {
            const result = await publicClient().readContract({
              address: CONTRACT_ADDRESS,
              abi: CROWDFUNDING_ABI,
              functionName: "getCampaignStats",
              args: [i],
            });

            if (result) {
              totalFunds += BigInt(result[0]); // raisedAmount
              totalContributors += Number(result[2]); // contributorsCount
            }
          } catch (err) {
            console.warn(`Error fetching stats for campaign ${i}:`, err);
          }
        }

        setStats({
          campaignsLaunched: campaignId,
          fundsRaised: totalFunds,
          contributors: totalContributors,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [campaignCount]);

  const features = [
    {
      icon: FiTarget,
      title: "Launch Your Ideas",
      description:
        "Create compelling campaigns and bring your innovative projects to life with blockchain transparency.",
    },
    {
      icon: FiShield,
      title: "Secure & Transparent",
      description:
        "Smart contracts ensure funds are safe and transactions are transparent on the blockchain.",
    },
    {
      icon: FiGlobe,
      title: "Decentralized",
      description:
        "No intermediaries, no censorship. Pure peer-to-peer crowdfunding on Ethereum.",
    },
    {
      icon: FiDatabase,
      title: "Immutable Records",
      description:
        "All campaign data and transactions are permanently stored on the blockchain and cannot be altered.",
    },
    {
      icon: FiFlag,
      title: "Milestone Based Funding",
      description:
        "Funds are released only when predefined milestones are successfully completed.",
    },
    {
      icon: FiThumbsUp,
      title: "Voting Based Donation",
      description:
        "Community votes determine how donations are allocated to the most promising and impactful ideas.",
    },
  ];

  const howItWorks = [
    {
      icon: FiCheckCircle,
      title: "Publish with confidence",
      description:
        "Use straightforward campaign setup tools and launch with full visibility for backers.",
    },
    {
      icon: FiClock,
      title: "Track progress in real time",
      description:
        "Monitor funding milestones, contributions, and campaign momentum from one dashboard.",
    },
    {
      icon: FiUsers,
      title: "Connect with supporters",
      description:
        "Build trust with clear updates, campaign transparency, and reliable on-chain data.",
    },
  ];

  const categoryDefinitions = [
    {
      icon: FiBookOpen,
      title: "Student Projects",
      description: "Support innovative student ideas and academic research.",
    },
    {
      icon: FiBriefcase,
      title: "Startups",
      description: "Help entrepreneurs turn ideas into successful businesses.",
    },
    {
      icon: FiBook,
      title: "Education",
      description: "Fund scholarships, learning programs, and educational initiatives.",
    },
    {
      icon: FiHeart,
      title: "Medical",
      description: "Support healthcare treatments and medical emergencies.",
    },
    {
      icon: FiGlobe,
      title: "Social Causes",
      description: "Contribute to community welfare and charitable projects.",
    },
    {
      icon: FiZap,
      title: "Research & Innovation",
      description: "Empower breakthrough technologies and scientific discoveries.",
    },
  ];

  const { useActiveCampaigns } = useContract();
  const { data: campaignsForLanding, isLoading: recentCampaignsLoading } = useActiveCampaigns(0, 100);
  const visibleRecentCampaigns = Array.isArray(campaignsForLanding)
    ? campaignsForLanding.slice(0, 4)
    : [];

  const [recentCreatorProfiles, setRecentCreatorProfiles] = useState({});
  const [campaignMetadataMap, setCampaignMetadataMap] = useState({});
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!Array.isArray(campaignsForLanding) || !campaignsForLanding.length) {
      setCampaignMetadataMap({});
      return;
    }

    const fetchMetadataForCampaigns = async () => {
      const entries = await Promise.all(
        campaignsForLanding.map(async (campaign) => {
          const id = campaign.id?.toString?.();
          if (!id || campaignMetadataMap[id] || !campaign.metadataHash) {
            return null;
          }

          const result = await getFromIPFS(campaign.metadataHash);
          return result.success ? [id, result.data] : null;
        })
      );

      const nextMap = entries.reduce((acc, entry) => {
        if (entry) {
          const [id, data] = entry;
          acc[id] = data;
        }
        return acc;
      }, {});

      if (Object.keys(nextMap).length) {
        setCampaignMetadataMap((prev) => ({ ...prev, ...nextMap }));
      }
    };

    fetchMetadataForCampaigns();
  }, [campaignsForLanding, campaignMetadataMap]);

  const liveCampaignData = useMemo(() => {
    const campaigns = Array.isArray(campaignsForLanding)
      ? campaignsForLanding.filter((campaign) => campaign?.active !== false)
      : [];

    const categoryTotals = campaigns.reduce((acc, campaign) => {
      const id = campaign.id?.toString?.();
      const metadata = id ? campaignMetadataMap[id] : null;
      const rawCategory = campaign.category?.toString?.() || metadata?.category?.toString?.() || "General";
      const normalizedCategory = rawCategory.toLowerCase();

      let categoryTitle = "General";
      if (normalizedCategory.includes("student")) {
        categoryTitle = "Student Projects";
      } else if (normalizedCategory.includes("startup")) {
        categoryTitle = "Startups";
      } else if (normalizedCategory.includes("education")) {
        categoryTitle = "Education";
      } else if (normalizedCategory.includes("medical")) {
        categoryTitle = "Medical";
      } else if (normalizedCategory.includes("social")) {
        categoryTitle = "Social Causes";
      } else if (normalizedCategory.includes("research") || normalizedCategory.includes("innovation")) {
        categoryTitle = "Research & Innovation";
      }

      if (!acc[categoryTitle]) {
        acc[categoryTitle] = {
          title: categoryTitle,
          campaigns: 0,
          ethRaised: 0,
        };
      }

      acc[categoryTitle].campaigns += 1;
      acc[categoryTitle].ethRaised += Number(campaign.raisedAmount?.toString?.() || "0") / 1e18;

      return acc;
    }, {});

    const categoryCards = categoryDefinitions.map((definition) => ({
      ...definition,
      campaigns: categoryTotals[definition.title]?.campaigns || 0,
      ethRaised: categoryTotals[definition.title]?.ethRaised || 0,
    }));

    return {
      activeCampaigns: campaigns.length,
      totalContributors: campaigns.reduce(
        (sum, campaign) => sum + Number(campaign.contributorsCount || 0),
        0
      ),
      totalRaisedEth: campaigns.reduce(
        (sum, campaign) => sum + Number(campaign.raisedAmount?.toString?.() || "0") / 1e18,
        0
      ),
      categoryCards,
    };
  }, [campaignsForLanding, campaignMetadataMap]);

  const categoryOverviewStats = useMemo(() => {
    const liveCategoryCount = liveCampaignData.categoryCards.filter((category) => category.campaigns > 0).length;

    return [
      {
        icon: FiTarget,
        label: `${liveCategoryCount} Categories`,
      },
      {
        icon: FiTrendingUp,
        label: `${liveCampaignData.activeCampaigns} Active Campaigns`,
      },
      {
        icon: FiUsers,
        label: `${liveCampaignData.totalContributors} Contributors`,
      },
    ];
  }, [liveCampaignData]);

  const campaignCategories = liveCampaignData.categoryCards;

  useEffect(() => {
    const campaignAddresses = Array.from(
      new Set(
        visibleRecentCampaigns
          .map((campaign) => campaign.creator?.toString?.()?.toLowerCase())
          .filter(Boolean)
      )
    );

    if (!campaignAddresses.length) {
      setRecentCreatorProfiles({});
      return;
    }

    const controller = new AbortController();
    const query = campaignAddresses.map(encodeURIComponent).join(",");

    const loadCreatorProfiles = async () => {
      try {
        const response = await fetch(
          `/api/wallet-link?walletAddresses=${query}`,
          { signal: controller.signal }
        );
        const data = await response.json();

        if (Array.isArray(data.walletProfiles)) {
          const nextProfiles = {};
          data.walletProfiles.forEach((profile) => {
            if (profile?.walletAddress) {
              nextProfiles[profile.walletAddress.toLowerCase()] = profile;
            }
          });
          setRecentCreatorProfiles(nextProfiles);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to load campaign creator profiles:", error);
        }
      }
    };

    loadCreatorProfiles();
    return () => controller.abort();
  }, [visibleRecentCampaigns]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleGoToCampaigns = () => {
    router.push("/all-campaigns");
  };
  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (!isLoaded || !user) {
      setIsGreetingVisible(true);
      return;
    }

    let hideTimer;
    let advanceTimer;

    setIsGreetingVisible(true);

    hideTimer = window.setTimeout(() => {
      setIsGreetingVisible(false);
    }, 2200);

    advanceTimer = window.setTimeout(() => {
      setGreetingIndex((prevIndex) => (prevIndex + 1) % greetingPhrases.length);
      setIsGreetingVisible(true);
    }, 2600);

    return () => {
      if (hideTimer) {
        window.clearTimeout(hideTimer);
      }
      if (advanceTimer) {
        window.clearTimeout(advanceTimer);
      }
    };
  }, [greetingIndex, isLoaded, user]);

  const currentUserName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "";
  const displayName = user?.firstName || user?.username || user?.fullName || "there";
  const displayGreeting = greetingIndex === 0 ? `Hello, ${displayName}!` : `${greetingPhrases[greetingIndex]}!`;

  return (
<div
  onMouseMove={(e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }}
  className="
    relative
    overflow-hidden
    bg-cover
    bg-no-repeat
    bg-[8%_-40px]
      sm:bg-[78%_-00px]
  "
  style={{
    backgroundImage: "url('/qweas.png')",
  }}
>
  {/* Wallet Connected Popup - Full Page Blur */}
  {showConnectedPopup && (
    <>
      
    </>
  )}

  {/* Background Overlay */}
  <div className="absolute inset-0 bg-black/55 z-[1]" />

  {/* Base Dots */}
  <div
    className="absolute inset-0 z-[2]
    [background-image:radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1.2px)]
    [background-size:10px_10px]"
  />

  {/* Desktop Interactive Bright Dots */}
  <div
    className="hidden md:block absolute inset-0 z-[3]
    [background-image:radial-gradient(rgba(255,255,255,0.95)_0.8px,transparent_1px)]
    [background-size:10px_10px]"
    style={{
      maskImage: `radial-gradient(
        circle 180px at ${mousePosition.x}px ${mousePosition.y}px,
        white 0%,
        transparent 75%
      )`,
      WebkitMaskImage: `radial-gradient(
        circle 180px at ${mousePosition.x}px ${mousePosition.y}px,
        white 0%,
        transparent 75%
      )`,
    }}
  />

  {/* Mobile Extra Visible Dots */}
  <div
    className="absolute inset-0 md:hidden z-[3]
    [background-image:radial-gradient(rgba(255, 255, 255, 0)_1px,transparent_1.2px)]
    [background-size:10px_10px]"
  />

      {/* Header */}
<header
  className={`
    fixed z-50
    shadow-sm
    backdrop-blur-md backdrop-saturate-150
    transition-all duration-800

    ${
      scrolled
        ? "top-0 left-0 right-0 rounded-none border-b border-gray-500 bg-gray-900/50 backdrop-blur-2xl"
        : "top-1 left-1 right-1 mt-1 rounded-4xl border border-gray-500 bg-gray-900/20"
    }
  `}
>
  <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-14 gap-2">
      
      {/* Logo + Title */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-14 h-14 flex items-center justify-center ">
            <img
              src="/logo2.gif"          // Place your logo in the public folder
              alt="CrowdFund Logo"
              className="w-full h-full object-contain"
            />
        </div>

        <span
          className={`font-bold text-white truncate
          text-lg sm:text-xl
          ${
            scrolled
              ? "transition-colors duration-[2000ms]"
              : ""
          }`}
        >
          CrowdFund
        </span>
      </div>

      {/* Auth / Wallet Actions */}
      <div
        className={`
          px-1 sm:px-4
          py-1
          rounded-3xl
          shadow-lg
          bg-white/0
          flex-shrink-0
          relative
        `}
      >
        {hasValidClerkKey ? (
          <>
            <SignedOut>
              <div className="flex items-center gap-2 text-white">
                <SignInButton mode="modal">
                  <button className="font-medium text-white text-sm whitespace-nowrap rounded-3xl  px-3 py-2">
                    Login 
                  </button>
                </SignInButton> / 
                <SignUpButton mode="modal">
                  <button className="font-medium text-white text-sm whitespace-nowrap rounded-3xl  px-3 py-2">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center gap-2">
                <UserButton afterSignOutUrl="/" />
                <ConnectButton.Custom>
                  {({ openConnectModal, mounted, account }) => {
                    if (!mounted) return null;

                    return (
                      <button
                        onClick={openConnectModal}
                        className="font-medium text-white text-sm whitespace-nowrap "
                      >
                        {account ? "Wallet Connected" : "Connect Wallet"}
                      </button>
                    );
                  }}
                </ConnectButton.Custom>
              </div>
            </SignedIn>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open("https://dashboard.clerk.com/last-active?path=api-keys", "_blank", "noopener,noreferrer")}
              className="font-medium text-black text-sm whitespace-nowrap rounded-3xl border border-gray-200 bg-white px-3 py-2 shadow-sm hover:bg-gray-50"
            >
              Configure Clerk
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
</header>

      {/* Hero Section */}
  <section className="relative overflow-hidden mt-[120px] mx-auto w-full max-w-7xl py-10 px-4 sm:px-6 lg:px-8">
  {/* Content */}
  <div className="relative z-10 pt-[60px] mt-0 mb-12">
    <div className="text-center mx-auto max-w-3xl">
      {isLoaded && user && (
        <div className="absolute -mt-[60px] ml-[250px] flex min-h-[2.8rem] items-center justify-center px-2 sm:min-h-[3.2rem]">
          <p
            className={`text-sm uppercase tracking-[0.35em] text-cyan-300 mb-3 mx-auto [text-shadow:0_0_10px_rgba(255,255,255,0.8)] max-w-[20rem] break-words text-center leading-tight  transition-all duration-500 ease-out sm:max-w-[32rem]  ${
              isGreetingVisible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
            }`}
          >
            {displayGreeting}
          </p>
        </div>
      )}
      <h1 className="text-xl md:text-[40px] font-bold text-white mb-6">
      Trusted Crowdfunding Platform!
        <span className="mt-5 block text-3xl text-blue-200">Decentralized & Secure</span>
      </h1>
      <p className="text-lg -mt-2 text-blue-100 mb-8 max-w-2xl ">
     Launch campaigns, support innovations, and empower projects with trusted support. Ensure every contribution is transparent, secure, and accountable through blockchain technology.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {hasValidClerkKey ? (
          <>
            <SignedOut>
              <div className="flex flex-col sm:flex-row gap-3">
                <SignInButton mode="modal">
                  <button className="bg-white text-cyan-600 px-8 py-4 rounded-4xl font-medium hover:bg-cyan-50 transition-colors">
                    Login
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-cyan-600/40 text-white px-8 py-4 rounded-4xl font-medium hover:bg-cyan-700 transition-colors border border-cyan-400">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>

            <SignedIn>
              {isConnected ? (
                <button
                  type="button"
                  onClick={handleGoToCampaigns}
                  className={`bg-white text-cyan-600 px-8 py-4 backdrop-blur-sm rounded-4xl font-medium hover:bg-cyan-500 hover:text-white transition-colors inline-flex items-center ${shouldBlinkDashboard ? 'blink-twice' : ''}`}
                >
                  Explore Campaigns
                  <FiArrowRight className="ml-2 w-5 h-5" />
                </button>
              ) : (
                <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 px-8 py-4 rounded-4xl hover:border-cyan-400">
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <button
                        onClick={openConnectModal}
                        className="text-white font-medium"
                      >
                        Connect Wallet to Start
                      </button>
                    )}
                  </ConnectButton.Custom>
                </div>
              )}
            </SignedIn>
          </>
        ) : (
          <>
            {isConnected ? (
              <button
                type="button"
                onClick={handleGoToCampaigns}
                className={`bg-white text-blue-600 px-8 py-4 rounded-4xl font-medium hover:bg-cyan-50 transition-colors inline-flex items-center ${shouldBlinkDashboard ? 'blink-twice' : ''}`}
              >
                Explore Campaigns
                <FiArrowRight className="ml-2 w-5 h-5" />
              </button>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 px-8 py-4 rounded-4xl hover:border-cyan-400">
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button
                      onClick={openConnectModal}
                      className="text-white font-medium"
                    >
                      Connect Wallet to Start
                    </button>
                  )}
                </ConnectButton.Custom>
              </div>
            )}
          </>
        )}

        <SignedIn>
          <button
            onClick={handleGoToDashboard}
            className="bg-transparent backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-4xl font-medium hover:bg-white hover:text-cyan-600 transition-colors"
          >
            Go to Dashboard
          </button>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-transparent backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-4xl font-medium hover:bg-white hover:text-cyan-600 transition-colors">
              Go to Dashboard
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
</div>
 
</section>
            <hr className="my-6 border-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" /> 

            {/* Recent Campaigns Section */}
      <section className="relative z-10 px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-cyan-400" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Recent Campaigns</span>
              </div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">Discover the Latest Campaigns</h2>
              <p className="text-base text-slate-400 max-w-lg leading-relaxed">
                See what the community is backing right now. Transparent progress, real contributors, on-chain data.
              </p>
            </div>
            <SignedIn>
              <button
                onClick={() => router.push("/all-campaigns")}
                className="inline-flex items-center gap-2 rounded-[40px] border-2 border-white/40 backdrop-blur-sm bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-white/[0.08] hover:border-white"
              >
                View All Campaigns
                <FiArrowRight className="w-4 h-4" />
              </button>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-white/[0.08] hover:border-white">
                  View All Campaigns
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </SignInButton>
            </SignedOut>
          </div>

          {recentCampaignsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02]  p-4 space-y-3 animate-pulse">
                  <div className="h-36 rounded-lg bg-white/[0.04]" />
                  <div className="h-4 w-3/4 rounded bg-white/[0.04]" />
                  <div className="h-3 w-1/2 rounded bg-white/[0.04]" />
                  <div className="h-1.5 rounded-full bg-white/[0.04]" />
                </div>
              ))}
            </div>
          ) : visibleRecentCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {visibleRecentCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  creatorProfile={recentCreatorProfiles[campaign.creator?.toString?.()?.toLowerCase()]}
                  currentUserAddress={address}
                  currentUserName={currentUserName}
                  isLandingCard
                  className="border-white/[0.08] bg-navy-300/70 backdrop-blur-sm"
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
              <p className="text-sm text-slate-400">No campaigns yet. Be the first to launch one.</p>
            </div>
          )}
        </div>
      </section>
 <hr className="my-6 border-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" /> 
{/* Stats Section */}
      <section className="relative z-10 py-16 px-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 mb-12">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-cyan-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Platform Metrics</span>
            </div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Real-Time Platform Momentum</h2>
            <p className="text-base text-slate-400 max-w-lg leading-relaxed">
              Live numbers from the blockchain. No inflated metrics — every stat is on-chain and verifiable.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                value: loading ? "..." : stats.campaignsLaunched,
                label: "Campaigns Launched",
                sub: "active on-chain",
              },
              {
                value: loading ? "..." : `\u039E ${(Number(stats.fundsRaised) / 1e18).toFixed(2)}`,
                label: "Total Raised",
                sub: "ETH contributed",
              },
              {
                value: loading ? "..." : stats.contributors,
                label: "Contributors",
                sub: "unique backers",
              },
            ].map((stat, i) => (
              <div key={i} className="rounded-xl border border-white/0 backdrop-blur-sm bg-cyan-800/30 p-6">
                <p className="text-3xl font-bold text-white tabular-nums">{stat.value}</p>
                <p className="mt-2 text-sm font-medium text-slate-300">{stat.label}</p>
                <p className="text-xs text-slate-600 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
 <hr className="my-6 border-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" /> 
{/* Explore Fundraising Categories Section */}
      <section className="relative z-10 px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-cyan-400" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Categories</span>
              </div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">Browse by Category</h2>
              <p className="text-base text-slate-400 max-w-lg leading-relaxed">
                Find campaigns that match your interests. Each category is curated for transparency and impact.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryOverviewStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-[15px] border border-white/0 backdrop-blur-sm bg-cyan-800/30  px-4 py-2.5"
                  >
                    <Icon className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm text-slate-300">{stat.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaignCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div
                  key={index}
                  className="group rounded-xl border-2 border-white/0 backdrop-blur-sm bg-cyan-800/30  p-5 transition-all duration-200  hover:border-cyan-800"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-white/10 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-white">{category.title}</h3>
                      <p className="mt-1 text-sm text-slate-400 line-clamp-2 leading-relaxed">{category.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-white">{category.campaigns}</span>
                      <span className="text-xs text-slate-500">campaign{category.campaigns !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-cyan-300">{category.ethRaised.toFixed(1)}</span>
                      <span className="text-xs text-slate-500">ETH raised</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
       <hr className="my-6 border-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" /> 
{/* Features Section */}
      <section className="relative z-10 px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 mb-12">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-cyan-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Why CrowdFund</span>
            </div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Built for Modern Crowdfunding</h2>
            <p className="text-base text-slate-400 max-w-lg leading-relaxed">
              Everything founders and backers need — transparent, secure, and built on-chain.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-xl border-2 border-white/0 backdrop-blur-sm bg-cyan-800/30  p-4 transition-all duration-200 hover:border-cyan-800"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-white/10 text-white">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-600 tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Go to Top */}
      <div className="relative z-10  -mt-[40px] mb-6 flex justify-center py-8">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/[0.12] hover:border-white/40 backdrop-blur-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          Go to Top
        </button>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cyan-700/50 bg-cyan-800/20 backdrop-blur-md text-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center">
                  <img
                    src="/logo2.gif"
                    alt="CrowdFund Logo"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div>
                  <p className="text-xl font-semibold text-white">CrowdFund</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Decentralized crowdfunding for the future.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                Product
              </h3>
              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                <li>
                  <a href="/all-campaigns" className="hover:text-white transition">
                    Browse campaigns
                  </a>
                </li>
                <li>
                  <a href="/create-campaign" className="hover:text-white transition">
                    Start a campaign
                  </a>
                </li>
                <li>
                  <a href="/dashboard" className="hover:text-white transition">
                    Your dashboard
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                Contact
              </h3>
              <p className="mt-5 text-sm text-slate-300">
                support@crowdfund.in
              </p>
              <p className="mt-3 text-sm text-slate-400">
                Follow us for the latest updates and launches.
              </p>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} CrowdFund. Built for modern on-chain funding.
          </div>
        </div>
      </footer>
    </div>
  );
}
