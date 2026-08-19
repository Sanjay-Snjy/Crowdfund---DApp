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

Create a local environment file and provide your configuration values such as:

- NEXT_PUBLIC_CONTRACT_ADDRESS
- NEXT_PUBLIC_NETWORK
- NEXT_PUBLIC_ADMIN_ADDRESS
- NEXT_PUBLIC_PINATA_API_KEY
- NEXT_PUBLIC_PINATA_SECRET_API_KEY
- NEXT_PUBLIC_PINATA_JWT

## Notes

- Make sure your contract address and network settings match your deployed environment.
- Avoid committing sensitive files such as environment files or private keys.
- The Hardhat folder contains deployment artifacts and local cache files that should be kept out of version control.
- Collaborator test commit by prajwal-a-m-5555
