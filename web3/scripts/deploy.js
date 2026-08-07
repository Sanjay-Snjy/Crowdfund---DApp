import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.NETWORK_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("Deploying contracts with the account:", wallet.address);
  console.log(
    "Account balance:",
    ethers.formatEther(await provider.getBalance(wallet.address))
  );

  const artifactPath = path.resolve(
    __dirname,
    "../artifacts/contracts/CrowdfundingMarketplace.sol/CrowdfundingMarketplace.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  console.log("\nDeploying CrowdfundingMarketplace contract...");
  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );
  const crowdfundingMarketplace = await factory.deploy();

  await crowdfundingMarketplace.waitForDeployment();
  const contractAddress = await crowdfundingMarketplace.getAddress();

  console.log("\nDeployment Successful!");
  console.log("------------------------");
  console.log("NEXT_PUBLIC_OWNER_ADDRESS:", wallet.address);
  console.log("NEXT_PUBLIC_crowdfundingMarketplace_ADDRESS:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
