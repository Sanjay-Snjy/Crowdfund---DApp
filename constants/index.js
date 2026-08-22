export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export const CAMPAIGN_CREATION_FEE = "0"; // no upfront creation fee

// Validate required environment variables
if (typeof window !== "undefined") {
  if (!CONTRACT_ADDRESS) {
    console.error(
      "NEXT_PUBLIC_CONTRACT_ADDRESS is not set in environment variables"
    );
  }
}

export const NETWORK_CONFIGS = {
  localhost: {
    name: "Localhost",
    chainId: 31337,
    rpcUrl: "http://localhost:8545",
    blockExplorer: "http://localhost:8545",
  },
  sepolia: {
    name: "Sepolia Testnet",
    chainId:  11155111,
    rpcUrl: "https://sepolia.infura.io/v3/1da513d7c5e94e52a8ba91f899602dde",
    blockExplorer: "https://sepolia.etherscan.io",
  },
};

export const SIDEBAR_ITEMS = [
   
  {
    id: "all-campaigns",
    label: "All Campaigns",
    icon: "FiList",
    path: "/all-campaigns",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "FiGrid",
    path: "/dashboard",
  },
 
  {
    id: "create",
    label: "Create Campaign",
    icon: "FiPlus",
    path: "/create-campaign",
  },
 
  {
    id: "contributions",
    label: "My Contributions",
    icon: "FiHeart",
    path: "/contributions",
  },
  {
    id: "admin",
    label: "Admin Panel",
    icon: "FiSettings",
    path: "/admin",
    adminOnly: true,
  },
];
