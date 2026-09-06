# CrowdFund - DApp

<p align="center">
  <img src="https://raw.githubusercontent.com/Sanjay-Snjy/Crowdfund---DApp/main/assets/demo.gif" alt="CrowdFund Demo" width="800">
</p>

CrowdFund is a decentralized crowdfunding platform built with Next.js, Solidity, Hardhat, Wagmi, and RainbowKit. The project allows users to connect a wallet, browse crowdfunding campaigns, create new campaigns, contribute funds, and track campaign activity on-chain.

## Overview

This application combines a modern React frontend with smart contracts deployed on a blockchain network. It is designed to bring transparency, immutability, and trust to crowdfunding by using blockchain technology to record campaign data and transactions.

## Key Features

- Connect wallet using RainbowKit and Wagmi
- Create and manage crowdfunding campaigns
- Contribute funds to campaigns directly from the dApp
- View campaign details, contribution status, and funding progress
- Display transparent blockchain-backed statistics
- Use a responsive UI built with Next.js and Tailwind CSS

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS
- Web3: Wagmi, RainbowKit, Ethers.js, Viem
- Smart Contracts: Solidity, Hardhat, OpenZeppelin

## Project Structure

- pages: Next.js route pages for the app UI
- components: Reusable UI components such as headers, cards, forms, and dashboards
- web3: Hardhat project containing Solidity smart contracts and deployment scripts
- constants: Contract ABI and environment-specific values
- utils: Helper functions and IPFS-related utilities

## Getting Started

### 1. Install dependencies

Install the frontend dependencies:

```bash
cd CF
npm install
```

Install the Hardhat dependencies:

```bash
cd CF/web3
npm install
```

### 2. Run the local blockchain

```bash
cd CF/web3
npx hardhat node
```

### 3. Deploy the smart contract

In a new terminal:

```bash
cd CF/web3
npx hardhat run scripts/deploy.js --network localhost
```

### 4. Start the frontend

```bash
cd CF
npm run dev
```

Then open http://localhost:3000 in your browser.

## Environment Variables

Create a local environment file and provide your configuration values. All `NEXT_PUBLIC_*`
values are safe to expose to the browser (they are embedded in the client bundle);
they must be set **both** in `.env.local` for local development **and** in the
hosting provider (e.g. Vercel) environment variables for the deployed site.

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | ✅ | **36-character UUID** from https://cloud.walletconnect.com (create a free project). RainbowKit's MetaMask wallet uses WalletConnect v2 as the **mobile** deep-link transport, so mobile connection hangs on "Connecting to MetaMask..." until this is a real project ID. Desktop extension connect works without it. |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | ✅ | Deployed Crowdfunding contract address (0x...) |
| `NEXT_PUBLIC_RPC_URL` | ✅ | RPC endpoint for the configured chain |
| `NEXT_PUBLIC_CHAIN_ID` | ✅ | Chain ID (e.g. `11155111` for Sepolia) |
| `NEXT_PUBLIC_CHAIN_NAME` | ✅ | Chain name (e.g. `Sepolia`) |
| `NEXT_PUBLIC_CHAIN_SYMBOL` | ✅ | Native currency symbol (e.g. `ETH`) |
| `NEXT_PUBLIC_NETWORK` | ✅ | Network key (`sepolia`, `localhost`, ...) |
| `NEXT_PUBLIC_BLOCK_EXPLORER` | Optional | Block explorer base URL |
| `NEXT_PUBLIC_BLOCK_EXPLORER_NAME` | Optional | Block explorer display name |
| `NEXT_PUBLIC_PLATFORM_NAME` | ✅ | App name shown to wallets |
| `NEXT_PUBLIC_ADMIN_ADDRESS` | ✅ | Admin wallet address for the admin panel |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Optional | Clerk publishable key (if Clerk auth is enabled) |
| `PINATA_API_KEY`, `PINATA_SECRET_API_KEY`, `PINATA_JWT` | ✅ (server-side) | Pinata credentials used by API routes only — **do not** give these a `NEXT_PUBLIC_` prefix |

## Notes

- Make sure your contract address and network settings match your deployed environment.
- Avoid committing sensitive files such as environment files or private keys.
- The Hardhat folder contains deployment artifacts and local cache files that should be kept out of version control.
- Collaborator test commit by prajwal-a-m-5555
