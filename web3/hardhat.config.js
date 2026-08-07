// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
// New verification plugin (migration from deprecated hardhat-etherscan)

require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      url: process.env.NETWORK_RPC_URL,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  paths: {
    artifacts: "./artifacts",
    sources: "./contracts",
    cache: "./cache",
    tests: "./test",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },

  sourcify: {
    enabled: true,
  },
};
