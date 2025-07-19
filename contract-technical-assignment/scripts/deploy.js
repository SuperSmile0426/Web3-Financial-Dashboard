const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  // Get the contract factories
  const FinancialPlatform = await ethers.getContractFactory("FinancialPlatform");
  const MockToken = await ethers.getContractFactory("MockToken");

  // Deploy FinancialPlatform
  console.log("Deploying FinancialPlatform...");
  const financialPlatform = await FinancialPlatform.deploy();
  await financialPlatform.waitForDeployment();
  const platformAddress = await financialPlatform.getAddress();
  console.log("FinancialPlatform deployed to:", platformAddress);

  // Deploy MockToken
  console.log("Deploying MockToken...");
  const mockToken = await MockToken.deploy("Platform Token", "PLT", 1000000); // 1M tokens
  await mockToken.waitForDeployment();
  const tokenAddress = await mockToken.getAddress();
  console.log("MockToken deployed to:", tokenAddress);

  // Get signers for testing
  const [deployer, user1, user2, user3, approver1] = await ethers.getSigners();

  console.log("\nSetting up initial data...");

  // Register test users
  console.log("Registering test users...");
  
  // Register user1 as Manager
  await financialPlatform.registerUser(
    user1.address,
    "John Manager",
    "john.manager@company.com",
    1 // Manager role
  );
  console.log("Registered user1 as Manager");

  // Register user2 as Regular user
  await financialPlatform.registerUser(
    user2.address,
    "Alice User",
    "alice.user@company.com",
    0 // Regular role
  );
  console.log("Registered user2 as Regular user");

  // Register user3 as Regular user
  await financialPlatform.registerUser(
    user3.address,
    "Bob User",
    "bob.user@company.com",
    0 // Regular role
  );
  console.log("Registered user3 as Regular user");

  // Register approver1 as Manager
  await financialPlatform.registerUser(
    approver1.address,
    "Sarah Approver",
    "sarah.approver@company.com",
    1 // Manager role
  );
  console.log("Registered approver1 as Manager");

  // Mint tokens to users for testing
  console.log("Minting tokens to users...");
  const tokenAmount = ethers.parseEther("10000"); // 10,000 tokens each

  await mockToken.mint(user1.address, tokenAmount);
  await mockToken.mint(user2.address, tokenAmount);
  await mockToken.mint(user3.address, tokenAmount);
  await mockToken.mint(approver1.address, tokenAmount);

  console.log("Minted 10,000 tokens to each user");

  // Create some sample transactions
  console.log("Creating sample transactions...");
  
  // Connect as user2 and create transactions
  const user2Platform = financialPlatform.connect(user2);
  
  // Transaction 1
  await user2Platform.createTransaction(
    user3.address,
    ethers.parseEther("1000")
  );
  console.log("Created transaction 1");

  // Transaction 2
  await user2Platform.createTransaction(
    user1.address,
    ethers.parseEther("2500")
  );
  console.log("Created transaction 2");

  // Connect as user3 and create transactions
  const user3Platform = financialPlatform.connect(user3);
  
  // Transaction 3
  await user3Platform.createTransaction(
    user2.address,
    ethers.parseEther("500")
  );
  console.log("Created transaction 3");

  // Request approvals for transactions
  console.log("Requesting approvals...");
  
  // Request approval for transaction 1
  await user2Platform.requestApproval(1);
  console.log("Requested approval for transaction 1");

  // Request approval for transaction 2
  await user2Platform.requestApproval(2);
  console.log("Requested approval for transaction 2");

  // Request approval for transaction 3
  await user3Platform.requestApproval(3);
  console.log("Requested approval for transaction 3");

  // Process some approvals
  console.log("Processing approvals...");
  const approver1Platform = financialPlatform.connect(approver1);
  
  // Approve transaction 1
  await approver1Platform.processApproval(1, true);
  console.log("Approved transaction 1");

  // Reject transaction 2
  await approver1Platform.processApproval(2, false);
  console.log("Rejected transaction 2");

  // Complete approved transaction
  await user2Platform.completeTransaction(1);
  console.log("Completed transaction 1");

  console.log("\nDeployment and setup completed successfully!");
  console.log("\nContract Addresses:");
  console.log("FinancialPlatform:", platformAddress);
  console.log("MockToken:", tokenAddress);
  console.log("\nTest Accounts:");
  console.log("Deployer (Admin):", deployer.address);
  console.log("User1 (Manager):", user1.address);
  console.log("User2 (Regular):", user2.address);
  console.log("User3 (Regular):", user3.address);
  console.log("Approver1 (Manager):", approver1.address);

  // Save deployment info for frontend
  const deploymentInfo = {
    network: "localhost",
    contracts: {
      FinancialPlatform: platformAddress,
      MockToken: tokenAddress
    },
    testAccounts: {
      deployer: deployer.address,
      user1: user1.address,
      user2: user2.address,
      user3: user3.address,
      approver1: approver1.address
    }
  };

  const fs = require('fs');
  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\nDeployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 