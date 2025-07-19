const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying contracts to Holesky testnet...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy FinancialPlatform
  console.log("\nDeploying FinancialPlatform contract...");
  const FinancialPlatform = await ethers.getContractFactory("FinancialPlatform");
  const financialPlatform = await FinancialPlatform.deploy();
  await financialPlatform.waitForDeployment();

  const financialPlatformAddress = await financialPlatform.getAddress();
  console.log("FinancialPlatform deployed to:", financialPlatformAddress);

  // Deploy MockToken
  console.log("\nDeploying MockToken contract...");
  const MockToken = await ethers.getContractFactory("MockToken");
  const mockToken = await MockToken.deploy("Mock Token", "MTK", 1000000);
  await mockToken.waitForDeployment();

  const mockTokenAddress = await mockToken.getAddress();
  console.log("MockToken deployed to:", mockTokenAddress);

  // Wait a bit for the deployment to be confirmed
  console.log("\nWaiting for deployment confirmation...");
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Verify the deployment
  console.log("\nVerifying deployment...");
  const deployedFinancialPlatform = await ethers.getContractAt("FinancialPlatform", financialPlatformAddress);
  const deployedMockToken = await ethers.getContractAt("MockToken", mockTokenAddress);

  console.log("FinancialPlatform verification successful");
  console.log("MockToken verification successful");

  console.log("\n" + "=".repeat(50));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(50));
  console.log("Network: Holesky Testnet");
  console.log("Deployer:", deployer.address);
  console.log("FinancialPlatform:", financialPlatformAddress);
  console.log("MockToken:", mockTokenAddress);
  console.log("=".repeat(50));
  
  console.log("\nNext steps:");
  console.log("1. Copy the FinancialPlatform address above");
  console.log("2. Update your .env.local file with:");
  console.log("   NEXT_PUBLIC_CONTRACT_ADDRESS=" + financialPlatformAddress);
  console.log("   NEXT_PUBLIC_NETWORK_ID=17000");
  console.log("   NEXT_PUBLIC_NETWORK_NAME=holesky");
  console.log("3. Restart your development server");
  console.log("4. Connect MetaMask to Holesky testnet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  }); 