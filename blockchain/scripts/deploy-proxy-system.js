const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer, admin, proposer, executor] = await ethers.getSigners();
  
  console.log("Deploying Proxy System with account:", deployer.address);

  console.log("\n1. Deploying ProxyAdmin...");
  const DeedChainProxyAdmin = await ethers.getContractFactory("DeedChainProxyAdmin");
  const proxyAdmin = await DeedChainProxyAdmin.deploy();
  await proxyAdmin.deployed();
  console.log("✅ ProxyAdmin deployed to:", proxyAdmin.address);

  console.log("\n2. Deploying Timelock...");
  const minDelay = 2 * 24 * 60 * 60; // 2 days
  const proposers = [proposer.address];
  const executors = [executor.address];
  
  const DeedChainTimelock = await ethers.getContractFactory("DeedChainTimelock");
  const timelock = await DeedChainTimelock.deploy(minDelay, proposers, executors, admin.address);
  await timelock.deployed();
  console.log("✅ Timelock deployed to:", timelock.address);

  console.log("\n3. Deploying Upgradeable DeedNFT...");
  const DeedNFTUpgradeable = await ethers.getContractFactory("DeedNFTUpgradeable");
  const deedNFTImpl = await DeedNFTUpgradeable.deploy();
  await deedNFTImpl.deployed();
  console.log("✅ DeedNFT implementation deployed to:", deedNFTImpl.address);

  console.log("\n4. Deploying Proxy...");
  const DeedChainProxy = await ethers.getContractFactory("DeedChainProxy");
  const initializeData = DeedNFTUpgradeable.interface.encodeFunctionData("initialize");
  const deedNFTProxy = await DeedChainProxy.deploy(deedNFTImpl.address, initializeData);
  await deedNFTProxy.deployed();
  console.log("✅ DeedNFT proxy deployed to:", deedNFTProxy.address);

  console.log("\n5. Setting up proxy admin...");
  await proxyAdmin.transferOwnership(timelock.address);
  console.log("✅ ProxyAdmin ownership transferred to timelock");

  console.log("\n🎉 PROXY SYSTEM DEPLOYED SUCCESSFULLY!");
  console.log("\n📋 PROXY SYSTEM ADDRESSES:");
  console.log("ProxyAdmin:", proxyAdmin.address);
  console.log("Timelock:", timelock.address);
  console.log("DeedNFT Implementation:", deedNFTImpl.address);
  console.log("DeedNFT Proxy:", deedNFTProxy.address);

  const proxyAddresses = {
    proxyAdmin: proxyAdmin.address,
    timelock: timelock.address,
    deedNFTImpl: deedNFTImpl.address,
    deedNFTProxy: deedNFTProxy.address,
  };

  console.log("\n📁 PROXY CONFIGURATION:");
  console.log(JSON.stringify(proxyAddresses, null, 2));
  console.log("Timelock Min Delay:", minDelay, "seconds");
  console.log("Proposers:", proposers);
  console.log("Executors:", executors);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Proxy deployment failed:", error);
    process.exit(1);
  });