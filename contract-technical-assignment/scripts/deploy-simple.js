const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying FinancialPlatform contract...");

  // Get the contract factory
  const FinancialPlatform = await ethers.getContractFactory("FinancialPlatform");

  // Deploy FinancialPlatform
  console.log("Deploying FinancialPlatform...");
  const financialPlatform = await FinancialPlatform.deploy();
  await financialPlatform.waitForDeployment();
  const platformAddress = await financialPlatform.getAddress();
  
  console.log("✅ FinancialPlatform deployed to:", platformAddress);
  console.log("\n📋 Contract Details:");
  console.log("Network: Holesky Testnet");
  console.log("Contract Address:", platformAddress);
  console.log("Deployer:", await financialPlatform.runner.getAddress());
  
  // Save deployment info
  const deploymentInfo = {
    network: "holesky",
    contractAddress: platformAddress,
    deployer: await financialPlatform.runner.getAddress(),
    deployedAt: new Date().toISOString()
  };

  const fs = require('fs');
  fs.writeFileSync(
    'holesky-deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to holesky-deployment.json");
  
  console.log("\n🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 