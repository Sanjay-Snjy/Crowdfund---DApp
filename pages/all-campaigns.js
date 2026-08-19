import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Layout from "../components/Layout/Layout";
<<<<<<< HEAD
import { useCachedCampaignList } from "../utils/reactQuery";
import { useUser } from "@clerk/nextjs";
import { useAccount } from "wagmi";
import { useContract } from "../hooks/useContract";
=======
import { useContract } from "../hooks/useContract";
import { useUser } from "@clerk/nextjs";
import { useAccount } from "wagmi";
>>>>>>> 374b56cba16025b1bcb101eb5056d5b7dd36860f
import { FiFilter, FiGrid, FiList, FiSearch } from "react-icons/fi";
import {
  calculateProgress,
  calculateTimeLeft,
  formatAddress,
  formatEther,
  validateEthereumAddress,
  getCreatorDisplayName,
} from "../utils/helpers";
import { getFromIPFS } from "../utils/ipfs";

const CATEGORIES = [
  "Discover",
  "Student Projects",
  "Medical",
  "Startup",
  "Education",
  "Research and Innovation",
  "Social Causes",
  "Technology",
  "Agriculture",
  "Arts and Culture",
  "Environment",
];

const HERO_SLIDES = [
  {
    image: "/Hero_banners/1.png",
    title: "Empower Student Projects",
    subtitle1: "Big ideas begin with bold student innovation.",
    subtitle2: "Support young creators and help their ideas take shape.",
  },
  {
    image: "/Hero_banners/2.png",
    title: "Support Better Healthcare",
    subtitle1: "Heal lives and bring hope through meaningful support.",
    subtitle2: "Fund medical treatments, equipment, and healthcare initiatives.",
  },
  {
    image: "/Hero_banners/3.png",
    title: "Fuel the Next Startup",
    subtitle1: "Turn ambitious ideas into the next big opportunity.",
    subtitle2: "Back startups and early-stage ventures shaping the future.",
  },
  {
    image: "/Hero_banners/4.png",
    title: "Empower Through Education",
    subtitle1: "Education creates opportunities and empowers every dream.",
    subtitle2: "Support learning, scholarships, and educational programs.",
  },
  {
    image: "/Hero_banners/5.png",
    title: "Research and Innovation",
    subtitle1: "Innovate today and create a lasting impact tomorrow.",
    subtitle2: "Fund research and breakthrough ideas that drive progress.",
  },
  {
    image: "/Hero_banners/10.png",
    title: "Create Meaningful Social Impact",
    subtitle1: "Together, we can create meaningful and lasting change.",
    subtitle2: "Support initiatives that uplift communities and transform lives.",
  },
  {
    image: "/Hero_banners/6.png",
    title: "Build Future with Technology",
    subtitle1: "Power bold ideas and build technology for the future.",
    subtitle2: "Support innovative solutions that transform the world.",
  },
  {
    image: "/Hero_banners/9.png",
    title: "Grow Sustainable Agriculture",
    subtitle1: "Grow smarter today and help feed a sustainable future.",
    subtitle2: "Support modern farming and sustainable agriculture projects.",
  },
  {
    image: "/Hero_banners/7.png",
    title: "Celebrate Arts and Culture",
    subtitle1: "Celebrate creativity while preserving culture and heritage.",
    subtitle2: "Support artists, performances, and inspiring cultural initiatives.",
  },
  {
    image: "/Hero_banners/8.png",
    title: "Protect Our Environment",
    subtitle1: "Protect our planet today for a sustainable tomorrow.",
    subtitle2: "Support projects that preserve nature and restore ecosystems.",
  },
];
function TopCampaignCard({ campaign, creatorProfile, metadata, currentUserAddress, currentUserName, viewMode = "grid" }) {
  const progress = calculateProgress(campaign.raisedAmount, campaign.targetAmount);
  const timeLeft = calculateTimeLeft(campaign.deadline);
  const creatorName = getCreatorDisplayName(
    campaign.creator,
    metadata?.creator,
    creatorProfile,
    currentUserAddress,
    currentUserName
  );
  const raised = parseFloat(formatEther(campaign.raisedAmount)).toFixed(2);
  const target = parseFloat(formatEther(campaign.targetAmount)).toFixed(2);
  const isListView = viewMode === "list";

  return (
    <div
      className={`overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950 ${
        isListView ? "flex flex-col md:flex-row" : "flex flex-col"
      }`}
    >
      <div className={`relative overflow-hidden ${isListView ? "h-[40px] md:h-auto md:w-64 lg:w-72" : "h-[180px]"}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/10 via-transparent to-slate-950/20" />
        {metadata?.image ? (
          <img
            src={metadata.image}
            alt={campaign.title}
            className="h-full w-full object-cover transition duration-500 ease-out hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-100 text-5xl font-bold text-slate-300 dark:bg-slate-900 dark:text-slate-600">
            {campaign.title?.charAt(0) || "C"}
          </div>
        )}

        <div className="absolute left-4 top-4 rounded-full bg-indigo-600/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {metadata?.category || "General"}
        </div>
        <div className="absolute right-4 top-4 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {campaign.active ? "Live" : "Closed"}
        </div>
      </div>

      <div className={`flex flex-1 flex-col justify-between ${isListView ? "p-5 md:p-6" : "p-5"}`}>
        <div className="space-y-2">
          <div>
            <h3 className="text-3d font-semibold text-slate-950 dark:text-white -mt-2">
              {campaign.title}
            </h3>
            {isListView && campaign.description && (
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400 line-clamp-3">
                {campaign.description}
              </p>
            )}
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              By {creatorName}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 -mt-6">
            <div className="rounded-3xl bg-slate-50 p-3 dark:bg-slate-900">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Raised</p>
              <p className="mt-2 text-base font-semibold text-slate-950 dark:text-white">{raised} ETH</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-3 dark:bg-slate-900">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Target</p>
              <p className="mt-2 text-base font-semibold text-slate-950 dark:text-white">{target} ETH</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-3 dark:bg-slate-900">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Progress</p>
              <p className="mt-2 text-base font-semibold text-slate-950 dark:text-white">{Math.round(progress)}%</p>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-100 py-1 px-2 text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            {timeLeft.text} left · {campaign.contributorsCount || 0} backers
          </div>
        </div>

        <Link href={`/campaign/${campaign.id}`} className="mt-4 block rounded-3xl bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-blue-700">
          View campaign
        </Link>
      </div>
    </div>
  );
}

export default function TopPage() {
  const { address: currentUserAddress } = useAccount();
  const { user } = useUser();
  const currentUserName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "";

  const { useActiveCampaigns } = useContract();
<<<<<<< HEAD
  const { data: campaigns, isLoading } = useCachedCampaignList(0, 100);
=======
  const { data: campaigns, isLoading } = useActiveCampaigns(0, 100);
>>>>>>> 374b56cba16025b1bcb101eb5056d5b7dd36860f
  const totalCampaigns = campaigns?.length || 0;
  const activeCampaigns = campaigns?.filter((campaign) => campaign.active).length || 0;
  const fundedCampaigns =
    campaigns?.filter(
      (campaign) =>
        parseFloat(campaign.raisedAmount?.toString() || "0") >=
        parseFloat(campaign.targetAmount?.toString() || "0")
    ).length || 0;
  const [activeCategory, setActiveCategory] = useState("Discover");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [creatorProfiles, setCreatorProfiles] = useState({});
  const loadedCreatorAddresses = useRef(new Set());
  const [campaignMetadataMap, setCampaignMetadataMap] = useState({});

  const displayedCampaigns = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return (campaigns || [])
      .filter((campaign) => {
        if (!campaign) return false;

        const metadata = campaignMetadataMap[campaign.id?.toString?.()];
        const category =
          campaign.category?.toString?.() ||
          metadata?.category?.toString?.() ||
          "";
        const title = campaign.title?.toString?.() || "";
        const description = campaign.description?.toString?.() || "";
        const raisedAmount = parseFloat(campaign.raisedAmount?.toString?.() || "0");
        const targetAmount = parseFloat(campaign.targetAmount?.toString?.() || "0");
        const isFunded = raisedAmount >= targetAmount;

        const matchesSearch =
          normalizedSearch === "" ||
          title.toLowerCase().includes(normalizedSearch) ||
          description.toLowerCase().includes(normalizedSearch);

        if (!matchesSearch) return false;

        if (activeCategory !== "Discover" && category.toLowerCase() !== activeCategory.toLowerCase()) {
          return false;
        }

        if (filterStatus === "active") return campaign.active;
        if (filterStatus === "funded") return isFunded;

        return true;
      })
      .sort((a, b) => {
        const aId = parseInt(a.id?.toString?.() || "0", 10);
        const bId = parseInt(b.id?.toString?.() || "0", 10);
        const aRaised = parseFloat(a.raisedAmount?.toString?.() || "0");
        const bRaised = parseFloat(b.raisedAmount?.toString?.() || "0");
        const aDeadline = parseInt(a.deadline?.toString?.() || "0", 10);
        const bDeadline = parseInt(b.deadline?.toString?.() || "0", 10);
        const aContributors = a.contributorsCount || 0;
        const bContributors = b.contributorsCount || 0;

        switch (sortBy) {
          case "ending":
            return aDeadline - bDeadline;
          case "funded":
            return bRaised - aRaised;
          case "popular":
            return bContributors - aContributors;
          case "newest":
          default:
            return bId - aId;
        }
      });
  }, [campaigns, activeCategory, searchTerm, filterStatus, sortBy, campaignMetadataMap]);

  const sortedCampaigns = displayedCampaigns;

  const campaignCreators = useMemo(() => {
    return Array.from(
      new Set(
        displayedCampaigns
          .map((campaign) => campaign.creator?.toString?.()?.toLowerCase())
          .filter(Boolean)
      )
    );
  }, [displayedCampaigns]);

  useEffect(() => {
    if (!campaigns?.length) {
      setCampaignMetadataMap({});
      return;
    }

    const fetchMetadataForCampaigns = async () => {
      const entries = await Promise.all(
        campaigns.map(async (campaign) => {
          const id = campaign.id?.toString?.();
          if (!id || campaignMetadataMap[id] || !campaign.metadataHash) {
            return null;
          }

          const result = await getFromIPFS(campaign.metadataHash);
          return result.success
            ? [id, result.data]
            : null;
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
  }, [campaigns, campaignMetadataMap]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const missingCreators = campaignCreators.filter(
      (address) => !loadedCreatorAddresses.current.has(address)
    );

    if (!missingCreators.length) {
      return;
    }

    const query = missingCreators.map(encodeURIComponent).join(",");
    const controller = new AbortController();

    const loadCreatorProfiles = async () => {
      try {
        const response = await fetch(
          `/api/wallet-link?walletAddresses=${query}`,
          { signal: controller.signal }
        );
        const data = await response.json();

        if (Array.isArray(data.walletProfiles)) {
          setCreatorProfiles((prev) => {
            const next = { ...prev };
            data.walletProfiles.forEach((profile) => {
              if (profile?.walletAddress) {
                next[profile.walletAddress.toLowerCase()] = profile;
                loadedCreatorAddresses.current.add(profile.walletAddress.toLowerCase());
              }
            });
            return next;
          });
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to load creator profiles:", error);
        }
      }
    };

    loadCreatorProfiles();
    return () => controller.abort();
  }, [campaignCreators]);

  return (
    <Layout>
      <div className="space-y-6 -mt-[18px] ml-1">
        <section className="relative overflow-hidden h-[328px] rounded-[32px] border border-slate-200/70 bg-slate-900 p-0 text-white ">
      <div className="absolute inset-0">
  {HERO_SLIDES.map((slide, index) => (
    <div
      key={slide.title}
      className={`absolute inset-0 transition-opacity duration-700 ${
        index === currentSlide
          ? "opacity-100"
          : "opacity-0 pointer-events-none"
      }`}
    >
      <img
        src={slide.image}
        alt={slide.title}
        className="ml-[148px] mt-[0px] h-[100%] w-[100%] object-contain"
        style={{ objectPosition: slide.position }}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-100/10" />
    </div>
  ))}
</div>

          <div className="relative z-10 flex flex-col gap-6 p-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-white backdrop-blur">
                <FiGrid className="h-4 w-4" />
                Campaign marketplace
              </div>

              <div className="mt-4 ml-auto">
              <h1 className="mt-8 text-5xl font-semibold tracking-tight">
                {HERO_SLIDES[currentSlide].title}
              </h1>
              <p className="mt-6 max-w-xl text-md text-slate-200">
                {HERO_SLIDES[currentSlide].subtitle1}
              </p>
              <p className="mt-3 max-w-xl text-md text-slate-200">
                {HERO_SLIDES[currentSlide].subtitle2}
              </p>
              <p className="mt-2 max-w-xl text-md text-slate-200">
                {HERO_SLIDES[currentSlide].subtitle3}
              </p>
              </div>
            </div>

           
          </div>

        <div className="absolute bottom-8 left-8 z-20 flex items-center gap-2">
  {HERO_SLIDES.map((slide, index) => (
    <button
      key={slide.title}
      type="button"
      onClick={() => setCurrentSlide(index)}
      className={`h-2.5 rounded-full transition-all ${
        index === currentSlide
          ? "w-8 bg-white"
          : "w-2.5 bg-white/50"
      }`}
      aria-label={`Show slide ${index + 1}`}
    />
  ))}
</div>
        </section>



        <section className="rounded-[32px] ">
            <div className="rounded-[32px]  bg-[#e6e6e6]/0 border border-transparent px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
                      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr] xl:grid-cols-[1.2fr_0.8fr] lg:items-center">
                        <div className="relative">
                          <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search campaigns"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-12 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
            
                        <div className="flex flex-wrap items-center justify-end gap-3">
                          <FiFilter className="mr-2 h-6 w-6 text-slate-500" />
                          <div className="flex min-w-[160px] flex-1 rounded-3xl border border-slate-300 bg-slate-50 px-2 py-[5px] dark:border-slate-700 dark:bg-slate-800">
                            <select
                              value={filterStatus}
                              onChange={(e) => setFilterStatus(e.target.value)}
                              className="w-full bg-transparent text-sm text-slate-900 rounded-2xl outline-none border border-transparent dark:text-white"
                            >
                              <option value="all">All statuses</option>
                              <option value="active">Active</option>
                              <option value="funded">Funded</option>
                            </select>
                          </div>
                          <div className="flex min-w-[160px] flex-1 rounded-3xl border border-slate-300 bg-slate-50 px-2 py-[5px] dark:border-slate-700 dark:bg-slate-800">
                            <select
                              value={sortBy}
                              onChange={(e) => setSortBy(e.target.value)}
                              className="w-full bg-transparent text-sm text-slate-90 border border-transparent rounded-2xl outline-none dark:text-white"
                            >
                              <option value="newest">Newest first</option>
                              <option value="ending">Ending soon</option>
                              <option value="funded">Most funded</option>
                              <option value="popular">Most popular</option>
                            </select>
                          </div>
                        </div>
                      </div>
            
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="ml-[0px] grid max-w-xl gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200/70 bg-white p-2 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">Total campaigns</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{totalCampaigns}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200/70 bg-white p-2 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">Active campaigns</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{activeCampaigns}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200/70 bg-white p-2 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">Funded campaigns</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{fundedCampaigns}</p>
              </div>
            </div>
            <div className="ml-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">Showing</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                  {sortedCampaigns.length} campaigns
                </p>
            </div>
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            onClick={() => setViewMode("grid")}
                            className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl text-slate-600 transition ${
                              viewMode === "grid"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 shadow-sm dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            <FiGrid className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setViewMode("list")}
                            className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl text-slate-600 transition ${
                              viewMode === "list"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 shadow-sm dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            <FiList className="h-5 w-5" />
                          </button>
                        </div>
               
                      </div>
                      
                    </div>
         
          <div className="flex items-center justify-between gap-4 ml-[50px] flex-wrap">
            <div className="flex overflow-x-auto no-scrollbar gap-2 py-2">
              {CATEGORIES.map((category) => {
                const isActive = category === activeCategory;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
         
          </div>
        </section>

        <section className="rounded-[32px] bg-transparent  px-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="mt-0 ml-2 text-2xl font-semibold text-slate-900 dark:text-white">
                {activeCategory} campaigns
              </h2>
            </div>
            
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-96 animate-pulse rounded-[32px] bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          ) : displayedCampaigns.length > 0 ? (
            <div className={viewMode === "list" ? "flex flex-col gap-4 px-28" : "grid gap-5  grid-cols-4"}>
              {displayedCampaigns.map((campaign) => (
                <TopCampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  metadata={campaignMetadataMap[campaign.id?.toString?.()]}
                  creatorProfile={creatorProfiles[campaign.creator?.toString?.()?.toLowerCase()]}
                  currentUserAddress={currentUserAddress}
                  currentUserName={currentUserName}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-900">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                No campaigns found in this category
              </h3>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Try another category or clear your search to discover more projects.
              </p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
