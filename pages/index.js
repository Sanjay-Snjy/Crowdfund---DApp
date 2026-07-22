import { useRouter } from "next/router";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { useAccount, useContractRead } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";
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

export default function Home() {
  const router = useRouter();
  const { isConnected } = useAccount();
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

  const campaignCategories = [
    {
      icon: FiBookOpen,
      title: "Student Projects",
      description: "Fund ideas from classrooms and campus innovators.",
    },
    {
      icon: FiBriefcase,
      title: "Startups",
      description: "Support scalable startups and early-stage founders.",
    },
    {
      icon: FiBook,
      title: "Education",
      description: "Back scholarships, learning tools, and school programs.",
    },
    {
      icon: FiHeart,
      title: "Medical",
      description: "Help fund urgent care, recovery, and health solutions.",
    },
    {
      icon: FiGlobe,
      title: "Social Causes",
      description: "Support community impact, relief, and advocacy campaigns.",
    },
    {
      icon: FiZap,
      title: "Research & Innovation",
      description: "Invest in experiments and next-generation breakthroughs.",
    },
  ,
  ];

  const { useActiveCampaigns } = useContract();
  const { data: recentCampaigns, isLoading: recentCampaignsLoading } = useActiveCampaigns(0, 4);
  const visibleRecentCampaigns = Array.isArray(recentCampaigns)
    ? recentCampaigns.slice(0, 4)
    : [];

  const [scrolled, setScrolled] = useState(false);

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
      {/* Blurred Background Overlay - Covers Entire Page */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-40" />
      
      {/* Centered Popup - Vertical Center */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-green-100 text-green-500 px-8 py-6 border-2 border-green-500 rounded-4xl text-lg font-medium shadow-2xl animate-scale-in">
          ✓ Wallet Connected
        </div>
      </div>
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
  <section className="relative overflow-hidden mt-40">
  {/* Content */}
  <div className="relative z-10 max-w-7xl pt-[60px] mx-auto px-4 sm:px-6 lg:px-8 mt-0 mb-12">
    <div className="text-center">
      {isLoaded && user && (
        <div className="absolute -mt-[60px] ml-[500px] flex min-h-[2.8rem] items-center justify-center px-2 sm:min-h-[3.2rem]">
          <p
            className={`text-sm uppercase tracking-[0.35em] text-cyan-300 mb-3 mx-auto [text-shadow:0_0_10px_rgba(255,255,255,0.8)] max-w-[20rem] break-words text-center leading-tight  transition-all duration-500 ease-out sm:max-w-[32rem]  ${
              isGreetingVisible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
            }`}
          >
            {displayGreeting}
          </p>
        </div>
      )}
      <h1 className="text-2xl md:text-5xl font-bold text-white mb-6">
      Trusted Crowdfunding Platform!
        <span className="mt-3 block text-4xl text-blue-200">Decentralized Funding</span>
      </h1>
      <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
     Launch campaigns, support innovations, and empower projects with trusted support. Ensure every contribution is transparent, secure, and accountable through blockchain technology.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {hasValidClerkKey ? (
          <>
            <SignedOut>
              <div className="flex flex-col sm:flex-row gap-3">
                <SignInButton mode="modal">
                  <button className="bg-white text-blue-600 px-8 py-4 rounded-4xl font-medium hover:bg-blue-50 transition-colors">
                    Login
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-blue-600 text-white px-8 py-4 rounded-4xl font-medium hover:bg-blue-700 transition-colors border border-blue-400">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>

            <SignedIn>
              {isConnected ? (
                <button
                  onClick={handleGoToDashboard}
                  className={`bg-white text-blue-600 px-8 py-4 rounded-4xl font-medium hover:bg-blue-50 transition-colors inline-flex items-center ${shouldBlinkDashboard ? 'blink-twice' : ''}`}
                >
                  Go to Dashboard
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
                onClick={handleGoToDashboard}
                className={`bg-white text-blue-600 px-8 py-4 rounded-4xl font-medium hover:bg-blue-50 transition-colors inline-flex items-center ${shouldBlinkDashboard ? 'blink-twice' : ''}`}
              >
                Go to Dashboard
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

        <button
          onClick={() => router.push("/campaigns")}
          className="bg-transparent  backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-4xl font-medium hover:bg-white hover:text-blue-600 transition-colors"
        >
          Explore Campaigns
        </button>
      </div>
    </div>
</div>
 
</section>
            <hr className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" /> 

      {/* Recent Campaigns Section */}
      <section className="relative z-10 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300 mb-3">
                Recent campaigns launched
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Discover the latest ideas gaining traction
              </h2>
            </div>
            <button
              onClick={() => router.push("/campaigns")}
              className=" inline-flex items-center justify-center rounded-full border border-cyan-300/30 bg-transparent backdrop-blur-sm px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Explore all campaigns
              <FiArrowRight className="ml-2 h-4 w-4" />
            </button>
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

            <hr className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" /> 

      {/* Explore Fundraising Categories Section */}
      <section className="relative z-10 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300 mb-3">
              Explore fundraising categories
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Find the right category for your next campaign
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/75">
              Discover projects across six professional categories, each designed to connect funders with the causes they care about most.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {campaignCategories.map((category, index) => (
              <div
                key={index}
                className="group rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/10"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-400/10 text-cyan-200 mb-5 transition-colors duration-300 group-hover:bg-cyan-400/20 group-hover:text-white">
                  <category.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{category.title}</h3>
                <p className="text-white/70 mb-6">{category.description}</p>
               
              </div>
            ))}
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

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5  backdrop-blur-sm p-8  transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/10"
              >
                <div className="absolute inset-x-0 top-0 h-32 bg-transparent" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-400/15 text-cyan-200 mb-6 transition group-hover:bg-cyan-400/25 group-hover:text-white">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="relative text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="relative  text-white/70">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
            <hr className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent " /> 

      {/* Stats Section */}
      <section className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
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
              <div className="rounded-[1.75rem] border border-cyan-300/10 bg-black/10 p-6 text-center shadow-xl shadow-cyan-500/5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30">
                <div className="text-3xl font-extrabold text-white mb-3">
                  {loading ? "..." : stats.campaignsLaunched}
                </div>
                <div className="text-sm uppercase tracking-[0.3em] text-cyan-200/90">
                  Campaigns Launched
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-cyan-300/10 bg-black/10 p-6 text-center shadow-xl shadow-cyan-500/5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30">
                <div className="text-3xl font-extrabold text-white mb-3">
                  {loading ? "..." : `Ξ ${(Number(stats.fundsRaised) / 1e18).toFixed(2)}`}
                </div>
                <div className="text-sm uppercase tracking-[0.3em] text-cyan-200/90">
                  Funds Raised
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-cyan-300/10 bg-black/10 p-6 text-center shadow-xl shadow-cyan-500/5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30">
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

