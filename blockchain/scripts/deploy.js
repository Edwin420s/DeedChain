const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy DeedNFT
  const DeedNFT = await ethers.getContractFactory("DeedNFT");
  const deedNFT = await DeedNFT.deploy();
  await deedNFT.deployed();
  console.log("DeedNFT deployed to:", deedNFT.address);

  // Deploy LandRegistry
  const LandRegistry = await ethers.getContractFactory("LandRegistry");
  const landRegistry = await LandRegistry.deploy(deedNFT.address);
  await landRegistry.deployed();
  console.log("LandRegistry deployed to:", landRegistry.address);

  // Deploy TokenizationManager
  const TokenizationManager = await ethers.getContractFactory("TokenizationManager");
  const tokenizationManager = await TokenizationManager.deploy(deedNFT.address);
  await tokenizationManager.deployed();
  console.log("TokenizationManager deployed to:", tokenizationManager.address);

  // Deploy DAOVerification
  const DAOVerification = await ethers.getContractFactory("DAOVerification");
  const daoVerification = await DAOVerification.deploy(deedNFT.address);
  await daoVerification.deployed();
  console.log("DAOVerification deployed to:", daoVerification.address);

  // Setup roles and permissions
  console.log("Setting up roles and permissions...");
  
  // Grant VERIFIER_ROLE to DAOVerification contract
  await deedNFT.grantRole(await deedNFT.VERIFIER_ROLE(), daoVerification.address);
  console.log("Granted VERIFIER_ROLE to DAOVerification");
  
  // Grant REGISTRAR_ROLE to deployer
  await deedNFT.grantRole(await deedNFT.REGISTRAR_ROLE(), deployer.address);
  console.log("Granted REGISTRAR_ROLE to deployer");

  console.log("Deployment completed successfully!");
  console.log("\nContract Addresses:");
  console.log("DeedNFT:", deedNFT.address);
  console.log("LandRegistry:", landRegistry.address);
  console.log("TokenizationManager:", tokenizationManager.address);
  console.log("DAOVerification:", daoVerification.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });