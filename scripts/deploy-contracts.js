const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying FinancialPlatform contract...");

  // Deploy FinancialPlatform
  const FinancialPlatform = await ethers.getContractFactory("FinancialPlatform");
  const financialPlatform = await FinancialPlatform.deploy();
  await financialPlatform.waitForDeployment();

  const financialPlatformAddress = await financialPlatform.getAddress();
  console.log("FinancialPlatform deployed to:", financialPlatformAddress);

  // Deploy MockToken
  const MockToken = await ethers.getContractFactory("MockToken");
  const mockToken = await MockToken.deploy("Mock Token", "MTK", 1000000);
  await mockToken.waitForDeployment();

  const mockTokenAddress = await mockToken.getAddress();
  console.log("MockToken deployed to:", mockTokenAddress);

  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log("FinancialPlatform:", financialPlatformAddress);
  console.log("MockToken:", mockTokenAddress);
  
  console.log("\nNext steps:");
  console.log("1. Copy the FinancialPlatform address above");
  console.log("2. Create a .env.local file in the project root");
  console.log("3. Add: NEXT_PUBLIC_CONTRACT_ADDRESS=" + financialPlatformAddress);
  console.log("4. Restart your development server");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 