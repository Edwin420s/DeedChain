const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying additional DeedChain modules with account:", deployer.address);

  // Load existing contract addresses
  const CONTRACT_ADDRESSES = {
    deedNFT: process.env.DEED_NFT_ADDRESS,
    deedToken: process.env.DEED_TOKEN_ADDRESS,
    tokenizationManager: process.env.TOKENIZATION_MANAGER_ADDRESS,
  };

  console.log("\n1. Deploying PropertyMarketplace...");
  const PropertyMarketplace = await ethers.getContractFactory("PropertyMarketplace");
  const propertyMarketplace = await PropertyMarketplace.deploy(
    CONTRACT_ADDRESSES.deedNFT,
    CONTRACT_ADDRESSES.tokenizationManager,
    CONTRACT_ADDRESSES.deedToken,
    deployer.address // fee recipient
  );
  await propertyMarketplace.deployed();
  console.log("✅ PropertyMarketplace deployed to:", propertyMarketplace.address);

  console.log("\n2. Deploying DisputeResolution...");
  const DisputeResolution = await ethers.getContractFactory("DisputeResolution");
  const disputeResolution = await DisputeResolution.deploy(CONTRACT_ADDRESSES.deedNFT);
  await disputeResolution.deployed();
  console.log("✅ DisputeResolution deployed to:", disputeResolution.address);

  console.log("\n3. Deploying DeedChainTreasury...");
  const DeedChainTreasury = await ethers.getContractFactory("DeedChainTreasury");
  const deedChainTreasury = await DeedChainTreasury.deploy(CONTRACT_ADDRESSES.deedToken);
  await deedChainTreasury.deployed();
  console.log("✅ DeedChainTreasury deployed to:", deedChainTreasury.address);

  // Setup roles and permissions
  console.log("\n4. Setting up module roles...");
  
  // Grant marketplace manager role
  await propertyMarketplace.grantRole(await propertyMarketplace.MARKETPLACE_MANAGER_ROLE(), deployer.address);
  console.log("✅ Granted MARKETPLACE_MANAGER_ROLE to deployer");

  // Grant dispute resolution roles
  await disputeResolution.grantRole(await disputeResolution.ARBITRATOR_ROLE(), deployer.address);
  await disputeResolution.grantRole(await disputeResolution.DISPUTE_MANAGER_ROLE(), deployer.address);
  console.log("✅ Granted dispute resolution roles to deployer");

  // Grant treasury roles
  await deedChainTreasury.grantRole(await deedChainTreasury.TREASURER_ROLE(), deployer.address);
  await deedChainTreasury.grantRole(await deedChainTreasury.WITHDRAWER_ROLE(), deployer.address);
  console.log("✅ Granted treasury roles to deployer");

  console.log("\n🎉 Additional Modules Deployment Completed!");
  console.log("\n📋 New Contract Addresses:");
  console.log("PropertyMarketplace:", propertyMarketplace.address);
  console.log("DisputeResolution:", disputeResolution.address);
  console.log("DeedChainTreasury:", deedChainTreasury.address);

  // Export addresses
  const newAddresses = {
    propertyMarketplace: propertyMarketplace.address,
    disputeResolution: disputeResolution.address,
    deedChainTreasury: deedChainTreasury.address,
  };

  console.log("\n📁 Export for frontend configuration:");
  console.log(JSON.stringify(newAddresses, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Module deployment failed:", error);
    process.exit(1);
  });