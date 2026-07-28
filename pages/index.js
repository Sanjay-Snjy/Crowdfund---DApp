import { useRouter } from "next/router";
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

  // Fetch campaign counter
  const { data: campaignCount } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CROWDFUNDING_ABI,
    functionName: "campaignCounter",
    watch: true,
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

  const applyLightTheme = () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("theme", "light");
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  };
  const handleGoToCampaigns = () => {
    applyLightTheme();
    router.push("/all-campaigns");
  };
  const handleGoToDashboard = () => {
    applyLightTheme();
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
    className="hidden md:block pointer-events-none absolute inset-0 z-[3]
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
    [background-image:radial-gradient(rgba(255,255,255,0.28)_1px,transparent_1.2px)]
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
        ? "top-0 left-0 right-0 rounded-none border-b-2 border-gray-500 bg-gray-900/50 backdrop-blur-2xl"
        : "top-1 left-1 right-1 mt-1 rounded-4xl border-2 border-gray-500 bg-gray-900/20"
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
  <section className="relative overflow-hidden mt-[120px] ml-[40px]">
  {/* Content */}
  <div className="relative z-10 max-w-7xl pt-[60px]  px-4 sm:px-6 lg:px-8 mt-0 mb-12">
    <div className="text-left">
      {isLoaded && user && (
        <div className="absolute -mt-[60px] ml-[00px] flex min-h-[2.8rem] items-center justify-left px-2 sm:min-h-[3.2rem]">
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

      <div className="flex flex-col sm:flex-row gap-4 justify-left">
        {hasValidClerkKey ? (
          <>
            <SignedOut>
              <div className="flex flex-col sm:flex-row gap-3">
                <SignInButton mode="modal">
                  <button className="bg-white text-cyan-600 px-8 py-4 rounded-4xl font-medium hover:bg-blue-50 transition-colors">
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
                  onClick={handleGoToCampaigns}
                  className={`bg-white text-blue-600 px-8 py-4 rounded-4xl font-medium hover:bg-blue-50 transition-colors inline-flex items-center ${shouldBlinkDashboard ? 'blink-twice' : ''}`}
                >
                  Explore Campaigns
                  <FiArrowRight className="ml-2 w-5 h-5" />
                </button>
              ) : (
                <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 px-8 py-4 rounded-4xl hover:border-blue-400">
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
                onClick={handleGoToCampaigns}
                className={`bg-white text-blue-600 px-8 py-4 rounded-4xl font-medium hover:bg-blue-50 transition-colors inline-flex items-center ${shouldBlinkDashboard ? 'blink-twice' : ''}`}
              >
                Explore Campaigns
                <FiArrowRight className="ml-2 w-5 h-5" />
              </button>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 px-8 py-4 rounded-4xl hover:border-blue-400">
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
            className="bg-transparent backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-4xl font-medium hover:bg-white hover:text-blue-600 transition-colors"
          >
            Go to Dashboard
          </button>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-transparent backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-4xl font-medium hover:bg-white hover:text-blue-600 transition-colors">
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
      <section className="relative z-10 px-[40px] py-10 ml-[0px]">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300 mb-3">
                Recent campaigns launched
              </p>
              <h2 className="text-[36px] font-bold text-white">
                Discover the latest ideas gaining traction
              </h2>
            </div>
            <SignedIn>
            
          <div className="ml-[300px]">
    <button
   onClick={() => router.push("/campaigns")}
  type="submit"
  class="flex justify-center gap-2 items-center  shadow-xl text-lg text-white bg-transparent backdrop-blur-md lg:font-semibold isolation-auto border-gray-50 before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-cyan-500  before:-z-10 before:aspect-square before:hover:scale-150 before:hover:duration-700 relative z-10 px-4 py-2 overflow-hidden border-2 border-white/60 rounded-full group"
    >
   Explore
    <svg
    class="w-8 h-8 justify-end bg-white/80 group-hover:rotate-90  text-white ease-linear duration-300 rounded-full border border-white group-hover:border-none p-2 rotate-45"
    viewBox="0 0 16 19"
    xmlns="http://www.w3.org/2000/svg"
   >
    <path
      d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
      class="fill-gray-800 group-hover:fill-gray-800"
    ></path>
  </svg>
</button></div> 

            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="inline-flex items-center justify-center rounded-full border border-cyan-300/30 bg-transparent backdrop-blur-sm px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Explore all campaigns
                  <FiArrowRight className="ml-2 h-4 w-4" />
                </button>
              </SignInButton>
            </SignedOut>
          </div>

          {recentCampaignsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="h-72 rounded-[1.5rem] border border-white/10 bg-transparent p-4 animate-pulse "
                />
              ))}
            </div>
          ) : visibleRecentCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
              {visibleRecentCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  creatorProfile={recentCreatorProfiles[campaign.creator?.toString?.()?.toLowerCase()]}
                  currentUserAddress={address}
                  currentUserName={currentUserName}
                  isLandingCard
                  className="border-white/10 shadow-2xl bg-transparent"
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-8 text-center text-white/80">
              No recent campaigns are available right now.
            </div>
          )}
        </div>
      </section>

            <hr className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" /> 

      {/* Explore Fundraising Categories Section */}
      <section className="relative z-10 px-[40px] py-8">
        <div className="px-[36px]">
          <div className="mb-12 text-left">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300 mb-3">
              Explore fundraising categories
            </p>
            <h2 className="text-[36px] font-bold text-white">
              Find the right category for your next campaign
            </h2>
            <p className="mt-4 max-w-2xl text-white/75">
              Discover projects across six professional categories, each designed to connect funders with the causes they care about most.
            </p>
          </div>

          <div className="mb-10 mr-[500px] grid gap-10 md:grid-cols-3">
            {categoryOverviewStats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <div
                  key={index}
                  className="items-center flex justify-center text-center rounded-[1.5rem] border border-cyan-300/20 bg-tranparent p-4  backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center rounded-2xl  text-cyan-200">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-md font-semibold text-white">{stat.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {campaignCategories.map((category, index) => {
              const Icon = category.icon;

              return (
                <div
                  key={index}
                  className="group rounded-[1.75rem] border border-white/5 bg-white/5 p-6 backdrop-blur-[10px] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/15"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-200 transition-colors duration-300 group-hover:bg-cyan-400/20 group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-white">{category.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-300/80">
                        {category.description}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-cyan-100/70">
                        <span className="inline-flex items-center gap-1.5">
                          <FiTarget className="h-3.5 w-3.5" />
                          {category.campaigns} Campaigns
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <FiTrendingUp className="h-3.5 w-3.5" />
                          {category.ethRaised.toFixed(1)} ETH Raised
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

            <hr className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" /> 

      {/* Features Section */}
      <section className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300 mb-3">
              Built for modern crowdfunding
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-0">
              Why founders trust CrowdFund
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-white/74">
              Powerful campaign tools, secure transactions, and better visibility for supporters—designed to help great ideas thrive.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 -mt-6">
            {features.map((feature, index) => (
    <div
      key={index}
      className="group relative mx-auto flex w-full max-w-4xl items-start gap-6 overflow-hidden rounded-[2rem] border border-white/5 bg-white/5 p-6 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/10"
    >
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-3xl bg-cyan-400/15 text-cyan-200 transition group-hover:bg-cyan-400/25 group-hover:text-white">
        <feature.icon className="h-6 w-6" />
      </div>

      <div className="flex-1">
        <h3 className="mb-2 text-xl font-semibold text-white">
          {feature.title}
        </h3>

        <p className="text-white/70">
          {feature.description}
        </p>
      </div>
    </div>
  ))}
</div>
        </div>
      </section>
            <hr className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent " /> 

      {/* Stats Section */}
      <section className="relative z-10 py-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem]  bg-transparent p-10 ">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
                  Real-time platform momentum
                </p>
                <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
            Our Impact Stats
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-white/70 md:text-right">
                Live campaign metrics, funds raised, and supporter activity that show how CrowdFund works for creators and contributors.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <div className="rounded-[1.75rem] border border-cyan-300/10 bg-white/10 p-6 text-center shadow-xl shadow-cyan-500/5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30">
                <div className="text-3xl font-extrabold text-white mb-3">
                  {loading ? "..." : stats.campaignsLaunched}
                </div>
                <div className="text-sm uppercase tracking-[0.3em] text-cyan-200/90">
                  Campaigns Launched
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-cyan-300/10 bg-white/10 p-6 text-center shadow-xl shadow-cyan-500/5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30">
                <div className="text-3xl font-extrabold text-white mb-3">
                  {loading ? "..." : `Ξ ${(Number(stats.fundsRaised) / 1e18).toFixed(2)}`}
                </div>
                <div className="text-sm uppercase tracking-[0.3em] text-cyan-200/90">
                  Funds Raised
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-cyan-300/10 bg-white/10 p-6 text-center shadow-xl shadow-cyan-500/5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30">
                <div className="text-3xl font-extrabold text-white mb-3">
                  {loading ? "..." : stats.contributors}
                </div>
                <div className="text-sm uppercase tracking-[0.3em] text-cyan-200/90">
                  Contributors
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
            <hr className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent " /> 

      {/* Footer */}
      <footer className="relative z-10 text-white backdrop-blur-lg bg-cyan-600/10 ">
        <br></br><br></br>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 flex items-center justify-center">
                 <img
              src="/logo2.gif"          // Place your logo in the public folder
              alt="CrowdFund Logo"
              className="w-full h-full object-contain"
            />
              </div>
              <span className="text-xl font-bold">CrowdFund</span>
            </div>
            <p className="text-gray-200 mb-4">
              Decentralized crowdfunding for the future
            </p>
            <p className="text-gray-400 text-sm">
              © 2026 Project: CrowdFund_G52.
            </p><br></br><br></br>
          </div>
        </div>
      </footer>
    </div>
  );
}

