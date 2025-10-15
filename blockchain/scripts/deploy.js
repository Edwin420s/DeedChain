const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy DeedNFT contract
  const DeedNFT = await ethers.getContractFactory("DeedNFT");
  const deedNFT = await DeedNFT.deploy();
  await deedNFT.deployed();
  console.log("DeedNFT deployed to:", deedNFT.address);

  // Deploy LandRegistry contract
  const LandRegistry = await ethers.getContractFactory("LandRegistry");
  const landRegistry = await LandRegistry.deploy(deedNFT.address);
  await landRegistry.deployed();
  console.log("LandRegistry deployed to:", landRegistry.address);

  // Deploy LandToken contract
  const LandToken = await ethers.getContractFactory("LandToken");
  const landToken = await LandToken.deploy();
  await landToken.deployed();
  console.log("LandToken deployed to:", landToken.address);

  // Deploy DAOVerification contract
  const DAOVerification = await ethers.getContractFactory("DAOVerification");
  const daoVerification = await DAOVerification.deploy();
  await daoVerification.deployed();
  console.log("DAOVerification deployed to:", daoVerification.address);

  // Setup roles and permissions
  console.log("Setting up roles and permissions...");

  // Grant REGISTRAR_ROLE to LandRegistry in DeedNFT
  const REGISTRAR_ROLE = await deedNFT.REGISTRAR_ROLE();
  await deedNFT.grantRole(REGISTRAR_ROLE, landRegistry.address);
  console.log("Granted REGISTRAR_ROLE to LandRegistry");

  // Grant VERIFIER_ROLE to LandRegistry in DeedNFT
  const VERIFIER_ROLE = await deedNFT.VERIFIER_ROLE();
  await deedNFT.grantRole(VERIFIER_ROLE, landRegistry.address);
  console.log("Granted VERIFIER_ROLE to LandRegistry");

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    deployer: deployer.address,
    contracts: {
      DeedNFT: deedNFT.address,
      LandRegistry: landRegistry.address,
      LandToken: landToken.address,
      DAOVerification: daoVerification.address
    },
    timestamp: new Date().toISOString()
  };

  console.log("Deployment completed successfully!");
  console.log("Deployment info:", JSON.stringify(deploymentInfo, null, 2));

  // Write deployment info to file
  const fs = require("fs");
  fs.writeFileSync(
    `deployment-${network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });