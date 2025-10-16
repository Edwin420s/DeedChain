const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Upgrading DeedChain contracts with account:", deployer.address);

  const existingAddresses = {
    deedNFT: process.env.DEED_NFT_UPGRADEABLE_ADDRESS,
    landRegistry: process.env.LAND_REGISTRY_UPGRADEABLE_ADDRESS,
  };

  console.log("\n1. Upgrading DeedNFT...");
  const DeedNFTUpgradeableV2 = await ethers.getContractFactory("DeedNFTUpgradeableV2");
  const upgradedDeedNFT = await upgrades.upgradeProxy(existingAddresses.deedNFT, DeedNFTUpgradeableV2);
  await upgradedDeedNFT.deployed();
  console.log("✅ DeedNFT upgraded to V2");

  console.log("\n2. Upgrading LandRegistry...");
  const LandRegistryUpgradeableV2 = await ethers.getContractFactory("LandRegistryUpgradeableV2");
  const upgradedLandRegistry = await upgrades.upgradeProxy(existingAddresses.landRegistry, LandRegistryUpgradeableV2);
  await upgradedLandRegistry.deployed();
  console.log("✅ LandRegistry upgraded to V2");

  console.log("\n🎉 Contract Upgrades Completed!");
  console.log("\n📋 Upgraded Contract Addresses:");
  console.log("DeedNFT V2:", upgradedDeedNFT.address);
  console.log("LandRegistry V2:", upgradedLandRegistry.address);

  // Get implementation addresses for verification
  const deedNFTImpl = await upgrades.erc1967.getImplementationAddress(upgradedDeedNFT.address);
  const landRegistryImpl = await upgrades.erc1967.getImplementationAddress(upgradedLandRegistry.address);
  
  console.log("\n📝 New Implementation Addresses:");
  console.log("DeedNFT Implementation:", deedNFTImpl);
  console.log("LandRegistry Implementation:", landRegistryImpl);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Upgrade failed:", error);
    process.exit(1);
  });