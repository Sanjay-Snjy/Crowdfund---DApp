import {
  getDefaultWallets,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { configureChains, createConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";

const PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;

// ---------------------------------------------------------------------------
// WalletConnect v2 project ID validation
// ---------------------------------------------------------------------------
// RainbowKit's MetaMask wallet connects on MOBILE through WalletConnect v2
// (deep link -> MetaMask app -> approval relayed back over WalletConnect).
// WalletConnect v2 requires a valid Cloud project ID: a 36-character UUID.
// If it is missing or invalid, the mobile round trip silently hangs on
// "Connecting to MetaMask..." while desktop (injected MetaMask extension
// provider) keeps working — exactly the reported mobile failure.
const WC_PROJECT_ID_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const hasValidProjectId =
  typeof PROJECT_ID === "string" &&
  PROJECT_ID.trim().length > 0 &&
  WC_PROJECT_ID_UUID.test(PROJECT_ID.trim());

if (!hasValidProjectId) {
  const detail = !PROJECT_ID
    ? "is not set"
    : `is invalid (${PROJECT_ID.length} characters — expected a 36-character UUID like 123e4567-e89b-12d3-a456-426614174000)`;
  console.error(
    `[wallet-config] NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ${detail}.\n` +
      "Mobile MetaMask connection (WalletConnect v2) will hang on 'Connecting to MetaMask...' until a real project ID is configured.\n" +
      "1) Create a free project at https://cloud.walletconnect.com (copy its Project ID).\n" +
      "2) Set NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID to that UUID in .env.local AND in your deployment (e.g. Vercel) environment variables.\n" +
      "Desktop MetaMask extension connection keeps working regardless."
  );
}
const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID);
const CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME;
const CHAIN_SYMBOL = process.env.NEXT_PUBLIC_CHAIN_SYMBOL;
const BLOCK_EXPLORER = process.env.NEXT_PUBLIC_BLOCK_EXPLORER;
const NETWORK_NAME = process.env.NEXT_PUBLIC_NETWORK;
const BLOCK_EXPLORER_NAME = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_NAME;

// Define your custom chain
const customChain = {
  id: CHAIN_ID,
  name: CHAIN_NAME,
  network: NETWORK_NAME,
  nativeCurrency: {
    name: CHAIN_SYMBOL,
    symbol: CHAIN_SYMBOL,
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [RPC_URL],
    },
    public: {
      http: [RPC_URL],
    },
  },
  blockExplorers: BLOCK_EXPLORER
    ? {
        default: {
          name: BLOCK_EXPLORER_NAME,
          url: BLOCK_EXPLORER,
        },
      }
    : undefined,
  testnet: NETWORK_NAME !== "mainnet",
};

// Configure chains and providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [customChain],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: RPC_URL,
      }),
    }),
    publicProvider(),
  ]
);

// Configure wallets - Get all defaults and filter to only MetaMask
const { wallets: defaultWallets } = getDefaultWallets({
  appName: process.env.NEXT_PUBLIC_PLATFORM_NAME,
  projectId: PROJECT_ID,
  chains,
});

// Filter to only include MetaMask
const filteredWallets = defaultWallets.map((walletGroup) => ({
  ...walletGroup,
  wallets: walletGroup.wallets.filter(
    (wallet) => wallet.id === "metaMask"
  ),
})).filter((group) => group.wallets.length > 0);

const connectors = connectorsForWallets(filteredWallets);

// Create wagmi config
export const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export { chains };
