const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying Complete DeedChain System with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Phase 1: Deploy Core Contracts
  console.log("\n=== PHASE 1: Deploying Core Contracts ===");
  
  const DeedToken = await ethers.getContractFactory("DeedToken");
  const deedToken = await DeedToken.deploy();
  await deedToken.deployed();
  console.log("✅ DeedToken deployed to:", deedToken.address);

  const DeedNFT = await ethers.getContractFactory("DeedNFT");
  const deedNFT = await DeedNFT.deploy();
  await deedNFT.deployed();
  console.log("✅ DeedNFT deployed to:", deedNFT.address);

  const LandRegistry = await ethers.getContractFactory("LandRegistry");
  const landRegistry = await LandRegistry.deploy(deedNFT.address);
  await landRegistry.deployed();
  console.log("✅ LandRegistry deployed to:", landRegistry.address);

  const TokenizationManager = await ethers.getContractFactory("TokenizationManager");
  const tokenizationManager = await TokenizationManager.deploy(deedNFT.address);
  await tokenizationManager.deployed();
  console.log("✅ TokenizationManager deployed to:", tokenizationManager.address);

  const DAOVerification = await ethers.getContractFactory("DAOVerification");
  const daoVerification = await DAOVerification.deploy(deedNFT.address);
  await daoVerification.deployed();
  console.log("✅ DAOVerification deployed to:", daoVerification.address);

  // Phase 2: Deploy Additional Modules
  console.log("\n=== PHASE 2: Deploying Additional Modules ===");
  
  const PropertyMarketplace = await ethers.getContractFactory("PropertyMarketplace");
  const propertyMarketplace = await PropertyMarketplace.deploy(
    deedNFT.address,
    tokenizationManager.address,
    deedToken.address,
    deployer.address
  );
  await propertyMarketplace.deployed();
  console.log("✅ PropertyMarketplace deployed to:", propertyMarketplace.address);

  const DisputeResolution = await ethers.getContractFactory("DisputeResolution");
  const disputeResolution = await DisputeResolution.deploy(deedNFT.address);
  await disputeResolution.deployed();
  console.log("✅ DisputeResolution deployed to:", disputeResolution.address);

  const DeedChainTreasury = await ethers.getContractFactory("DeedChainTreasury");
  const deedChainTreasury = await DeedChainTreasury.deploy(deedToken.address);
  await deedChainTreasury.deployed();
  console.log("✅ DeedChainTreasury deployed to:", deedChainTreasury.address);

  const DeedChainGovernance = await ethers.getContractFactory("DeedChainGovernance");
  const deedChainGovernance = await DeedChainGovernance.deploy(deedToken.address);
  await deedChainGovernance.deployed();
  console.log("✅ DeedChainGovernance deployed to:", deedChainGovernance.address);

  // Phase 3: Deploy Main Registry
  console.log("\n=== PHASE 3: Deploying Main Registry ===");
  
  const DeedChainRegistry = await ethers.getContractFactory("DeedChainRegistry");
  const deedChainRegistry = await DeedChainRegistry.deploy();
  await deedChainRegistry.deployed();
  console.log("✅ DeedChainRegistry deployed to:", deedChainRegistry.address);

  // Phase 4: Setup System
  console.log("\n=== PHASE 4: System Setup ===");
  
  // Initialize main registry
  await deedChainRegistry.initializeSystem(
    deedNFT.address,
    landRegistry.address,
    tokenizationManager.address,
    daoVerification.address
  );
  console.log("✅ Main registry initialized");

  // Add modules to registry
  await deedChainRegistry.addMarketplaceModule(propertyMarketplace.address);
  await deedChainRegistry.addDisputeResolutionModule(disputeResolution.address);
  await deedChainRegistry.addTreasuryModule(deedChainTreasury.address);
  console.log("✅ Modules added to registry");

  // Wire dispute module into LandRegistry so transfers respect freezes
  if (landRegistry.setDisputeResolution) {
    await landRegistry.setDisputeResolution(disputeResolution.address);
    console.log("✅ LandRegistry linked to DisputeResolution");
  }

  // Setup roles and permissions
  await deedNFT.grantRole(await deedNFT.VERIFIER_ROLE(), daoVerification.address);
  await deedNFT.grantRole(await deedNFT.REGISTRAR_ROLE(), landRegistry.address);
  await deedNFT.grantRole(await deedNFT.REGISTRAR_ROLE(), deployer.address);
  // Grant tokenization control to TokenizationManager
  if (deedNFT.TOKENIZER_ROLE) {
    await deedNFT.grantRole(await deedNFT.TOKENIZER_ROLE(), tokenizationManager.address);
  }

  await deedToken.grantRole(await deedToken.MINTER_ROLE(), deedChainGovernance.address);
  
  // Add initial validators
  const initialValidators = process.env.INITIAL_VALIDATORS ? 
    process.env.INITIAL_VALIDATORS.split(',') : [deployer.address];
  
  for (const validator of initialValidators) {
    await daoVerification.addValidator(validator);
    console.log(`✅ Added validator: ${validator}`);
  }

  console.log("\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
  console.log("\n📋 COMPLETE CONTRACT ADDRESSES:");
  console.log("DeedToken:", deedToken.address);
  console.log("DeedNFT:", deedNFT.address);
  console.log("LandRegistry:", landRegistry.address);
  console.log("TokenizationManager:", tokenizationManager.address);
  console.log("DAOVerification:", daoVerification.address);
  console.log("PropertyMarketplace:", propertyMarketplace.address);
  console.log("DisputeResolution:", disputeResolution.address);
  console.log("DeedChainTreasury:", deedChainTreasury.address);
  console.log("DeedChainGovernance:", deedChainGovernance.address);
  console.log("DeedChainRegistry:", deedChainRegistry.address);

  // Export all addresses
  const completeAddresses = {
    deedToken: deedToken.address,
    deedNFT: deedNFT.address,
    landRegistry: landRegistry.address,
    tokenizationManager: tokenizationManager.address,
    daoVerification: daoVerification.address,
    propertyMarketplace: propertyMarketplace.address,
    disputeResolution: disputeResolution.address,
    deedChainTreasury: deedChainTreasury.address,
    deedChainGovernance: deedChainGovernance.address,
    deedChainRegistry: deedChainRegistry.address,
  };

  console.log("\n📁 COMPLETE FRONTEND CONFIGURATION:");
  console.log(JSON.stringify(completeAddresses, null, 2));

  console.log("\n🚀 Next steps:");
  console.log("1. Run: npx hardhat run scripts/verify-contracts.js --network linea");
  console.log("2. Run: npx hardhat run scripts/mock-data.js --network linea");
  console.log("3. Update frontend with contract addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Final deployment failed:", error);
    process.exit(1);
  });