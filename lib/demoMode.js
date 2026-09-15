import { useState, useEffect } from "react";

const STORAGE_KEY = "crowdfund_demo";

// ── Static demo values ──────────────────────────────────────────────────────
export const DEMO_USERNAME = "Demo";
export const DEMO_ETH = "1.5 ETH";
export const DEMO_ETH_BALANCE = "0";
export const DEMO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const DEMO_CHAIN_NAME = "Demo Network";
export const DEMO_CHAIN_ID = 0;

// ── Read / write helpers ─────────────────────────────────────────────────────
export function isDemoMode() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function enterDemoMode() {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, "true");
}

export function exitDemoMode() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Toggle helper that fires a DOM event so every useDemoMode() consumer
 * re-renders immediately.
 */
export function setDemoMode(value) {
  if (value) {
    enterDemoMode();
  } else {
    exitDemoMode();
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("demoModeChanged"));
  }
}

/**
 * React hook that reflects the current demoMode flag.
 */
export function useDemoMode() {
  const [demo, setDemo] = useState(() => isDemoMode());

  useEffect(() => {
    const handler = () => setDemo(isDemoMode());
    window.addEventListener("storage", handler);
    window.addEventListener("demoModeChanged", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("demoModeChanged", handler);
    };
  }, []);

  return demo;
}

// ── Fake dashboard data ──────────────────────────────────────────────────────
const now = Math.floor(Date.now() / 1000);
const DAY = 86400;

export const DEMO_CAMPAIGNS = [
  {
    id: 1,
    title: "Clean Water for Rural Schools",
    description: "Providing sustainable water filtration systems to schools in underserved communities.",
    creator: "0xAbCdEf1234567890AbCdEf1234567890AbCdEf12",
    targetAmount: BigInt("2000000000000000000"),
    raisedAmount: BigInt("1400000000000000000"),
    contributorsCount: 34,
    deadline: now + 15 * DAY,
    active: true,
    metadataHash: "",
    category: "Education",
  },
  {
    id: 2,
    title: "Open-Source Dev Toolkit",
    description: "A developer toolkit for building decentralized applications faster.",
    creator: "0x1234567890AbCdEf1234567890AbCdEf12345678",
    targetAmount: BigInt("5000000000000000000"),
    raisedAmount: BigInt("3250000000000000000"),
    contributorsCount: 58,
    deadline: now + 30 * DAY,
    active: true,
    metadataHash: "",
    category: "Technology",
  },
  {
    id: 3,
    title: "Student Startup Accelerator",
    description: "Funding the next generation of student-led startups with micro-grants and mentorship.",
    creator: "0x9876543210FeDcBa9876543210FeDcBa98765432",
    targetAmount: BigInt("3000000000000000000"),
    raisedAmount: BigInt("1200000000000000000"),
    contributorsCount: 22,
    deadline: now + 45 * DAY,
    active: true,
    metadataHash: "",
    category: "Startup",
  },
];

export const DEMO_CONTRIBUTIONS = [1, 2, 3];

export const DEMO_CONTRIBUTION_MAP = {
  1: { amount: BigInt("500000000000000000") },
  2: { amount: BigInt("250000000000000000") },
  3: { amount: BigInt("100000000000000000") },
};

export const DEMO_ACTIVE_CAMPAIGNS = DEMO_CAMPAIGNS;

export const DEMO_TRANSACTION_FEED = [
  { campaignId: 1, campaignTitle: "Clean Water for Rural Schools", action: "Contribution", amount: BigInt("500000000000000000"), timestamp: now - 2 * DAY },
  { campaignId: 2, campaignTitle: "Open-Source Dev Toolkit", action: "Contribution", amount: BigInt("250000000000000000"), timestamp: now - 5 * DAY },
  { campaignId: 3, campaignTitle: "Student Startup Accelerator", action: "Contribution", amount: BigInt("100000000000000000"), timestamp: now - 8 * DAY },
];

export const DEMO_CONTRACT_STATS = {
  totalCampaigns: BigInt(12),
  totalContributors: BigInt(144),
  totalRaised: BigInt("47500000000000000000"),
  totalFees: BigInt("950000000000000000"),
  contractBalance: BigInt("46550000000000000000"),
};

export const DEMO_PLATFORM_STATS = {
  totalCampaigns: 12,
  totalRaised: 47.5,
  totalContributors: 144,
  activeCampaigns: 5,
  successfulCampaigns: 3,
  platformFees: 0.95,
};

export const DEMO_MILESTONES = [
  [
    { title: "Phase 1 - Planning", percentage: 20, fundsReleased: true, completed: true, voteRequested: false },
    { title: "Phase 2 - Build", percentage: 50, fundsReleased: false, completed: true, voteRequested: true },
    { title: "Phase 3 - Launch", percentage: 30, fundsReleased: false, completed: false, voteRequested: false },
  ],
  [
    { title: "MVP Release", percentage: 60, fundsReleased: true, completed: true, voteRequested: false },
    { title: "Beta & Polish", percentage: 40, fundsReleased: false, completed: false, voteRequested: false },
  ],
  [
    { title: "Seed Round", percentage: 40, fundsReleased: true, completed: true, voteRequested: false },
    { title: "Accelerator Entry", percentage: 30, fundsReleased: false, completed: true, voteRequested: true },
    { title: "Market Launch", percentage: 30, fundsReleased: false, completed: false, voteRequested: false },
  ],
];

export const DEMO_NOTIFICATIONS = [
  { id: "demo-1", type: "contribution", title: "New contribution to Clean Water for Rural Schools", detail: "0.5000 ETH", time: now - 2 * DAY, unread: true },
  { id: "demo-2", type: "contribution", title: "New contribution to Open-Source Dev Toolkit", detail: "0.2500 ETH", time: now - 5 * DAY, unread: true },
  { id: "demo-3", type: "deadline", title: "Clean Water for Rural Schools ends soon", detail: "15 days left", time: now, unread: false },
];
