const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying complete DeedChain system with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy Governance Token First
  console.log("\n1. Deploying Governance Token...");
  const DeedToken = await ethers.getContractFactory("DeedToken");
  const deedToken = await DeedToken.deploy();
  await deedToken.deployed();
  console.log("✅ DeedToken deployed to:", deedToken.address);

  // Deploy Core Contracts
  console.log("\n2. Deploying Core Contracts...");
  
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

  // Deploy Additional Modules
  console.log("\n3. Deploying Additional Modules...");
  
  const DeedChainGovernance = await ethers.getContractFactory("DeedChainGovernance");
  const deedChainGovernance = await DeedChainGovernance.deploy(deedToken.address);
  await deedChainGovernance.deployed();
  console.log("✅ DeedChainGovernance deployed to:", deedChainGovernance.address);

  // For testing, use mock price feed address
  const mockPriceFeed = "0x..."; // Replace with actual Chainlink price feed
  const PropertyValuation = await ethers.getContractFactory("PropertyValuation");
  const propertyValuation = await PropertyValuation.deploy(mockPriceFeed);
  await propertyValuation.deployed();
  console.log("✅ PropertyValuation deployed to:", propertyValuation.address);

  const PropertyAuction = await ethers.getContractFactory("PropertyAuction");
  const propertyAuction = await PropertyAuction.deploy(deedNFT.address);
  await propertyAuction.deployed();
  console.log("✅ PropertyAuction deployed to:", propertyAuction.address);

  const PropertyInsurance = await ethers.getContractFactory("PropertyInsurance");
  const propertyInsurance = await PropertyInsurance.deploy(deedNFT.address);
  await propertyInsurance.deployed();
  console.log("✅ PropertyInsurance deployed to:", propertyInsurance.address);

  // Setup Roles and Permissions
  console.log("\n4. Setting up Roles and Permissions...");
  
  // Grant VERIFIER_ROLE to DAOVerification
  await deedNFT.grantRole(await deedNFT.VERIFIER_ROLE(), daoVerification.address);
  console.log("✅ Granted VERIFIER_ROLE to DAOVerification");

  // Grant REGISTRAR_ROLE to LandRegistry
  await deedNFT.grantRole(await deedNFT.REGISTRAR_ROLE(), landRegistry.address);
  console.log("✅ Granted REGISTRAR_ROLE to LandRegistry");

  // Add initial validators
  const initialValidators = process.env.INITIAL_VALIDATORS ? 
    process.env.INITIAL_VALIDATORS.split(',') : [deployer.address];
  
  for (const validator of initialValidators) {
    await daoVerification.addValidator(validator);
    console.log(`✅ Added validator: ${validator}`);
  }

  // Grant MINTER_ROLE to governance contract
  await deedToken.grantRole(await deedToken.MINTER_ROLE(), deedChainGovernance.address);
  console.log("✅ Granted MINTER_ROLE to DeedChainGovernance");

  console.log("\n🎉 DeedChain System Deployment Completed!");
  console.log("\n📋 Contract Addresses:");
  console.log("DeedToken:", deedToken.address);
  console.log("DeedNFT:", deedNFT.address);
  console.log("LandRegistry:", landRegistry.address);
  console.log("TokenizationManager:", tokenizationManager.address);
  console.log("DAOVerification:", daoVerification.address);
  console.log("DeedChainGovernance:", deedChainGovernance.address);
  console.log("PropertyValuation:", propertyValuation.address);
  console.log("PropertyAuction:", propertyAuction.address);
  console.log("PropertyInsurance:", propertyInsurance.address);

  // Export addresses for frontend
  const addresses = {
    deedToken: deedToken.address,
    deedNFT: deedNFT.address,
    landRegistry: landRegistry.address,
    tokenizationManager: tokenizationManager.address,
    daoVerification: daoVerification.address,
    deedChainGovernance: deedChainGovernance.address,
    propertyValuation: propertyValuation.address,
    propertyAuction: propertyAuction.address,
    propertyInsurance: propertyInsurance.address,
  };

  console.log("\n📁 Export for frontend configuration:");
  console.log(JSON.stringify(addresses, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });