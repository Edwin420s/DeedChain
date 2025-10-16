const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying Upgradeable DeedChain System with account:", deployer.address);

  console.log("\n1. Deploying Upgradeable DeedNFT...");
  const DeedNFTUpgradeable = await ethers.getContractFactory("DeedNFTUpgradeable");
  const deedNFT = await upgrades.deployProxy(DeedNFTUpgradeable, [], {
    initializer: "initialize",
    kind: "uups"
  });
  await deedNFT.deployed();
  console.log("✅ DeedNFTUpgradeable deployed to:", deedNFT.address);

  console.log("\n2. Deploying Upgradeable LandRegistry...");
  const LandRegistryUpgradeable = await ethers.getContractFactory("LandRegistryUpgradeable");
  const landRegistry = await upgrades.deployProxy(LandRegistryUpgradeable, [deedNFT.address], {
    initializer: "initialize",
    kind: "uups"
  });
  await landRegistry.deployed();
  console.log("✅ LandRegistryUpgradeable deployed to:", landRegistry.address);

  console.log("\n3. Setting up roles...");
  await deedNFT.grantRole(await deedNFT.REGISTRAR_ROLE(), landRegistry.address);
  await deedNFT.grantRole(await deedNFT.REGISTRAR_ROLE(), deployer.address);
  await deedNFT.grantRole(await deedNFT.VERIFIER_ROLE(), deployer.address);
  
  console.log("✅ Roles configured");

  console.log("\n🎉 Upgradeable System Deployed!");
  console.log("\n📋 Contract Addresses:");
  console.log("DeedNFTUpgradeable:", deedNFT.address);
  console.log("LandRegistryUpgradeable:", landRegistry.address);

  // Prepare for verification
  console.log("\n📝 For verification, use these implementation addresses:");
  const deedNFTImpl = await upgrades.erc1967.getImplementationAddress(deedNFT.address);
  const landRegistryImpl = await upgrades.erc1967.getImplementationAddress(landRegistry.address);
  
  console.log("DeedNFT Implementation:", deedNFTImpl);
  console.log("LandRegistry Implementation:", landRegistryImpl);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Upgradeable deployment failed:", error);
    process.exit(1);
  });