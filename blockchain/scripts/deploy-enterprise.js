const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer, signer1, signer2, signer3] = await ethers.getSigners();
  
  console.log("Deploying Enterprise DeedChain System with account:", deployer.address);

  // Phase 1: Deploy Core Enterprise Contracts
  console.log("\n=== PHASE 1: Deploying Enterprise Contracts ===");
  
  const DeedChainIdentity = await ethers.getContractFactory("DeedChainIdentity");
  const identity = await DeedChainIdentity.deploy();
  await identity.deployed();
  console.log("✅ DeedChainIdentity deployed to:", identity.address);

  const DeedChainRewards = await ethers.getContractFactory("DeedChainRewards");
  const rewards = await DeedChainRewards.deploy(process.env.REWARD_TOKEN_ADDRESS);
  await rewards.deployed();
  console.log("✅ DeedChainRewards deployed to:", rewards.address);

  // Multi-sig setup
  const signers = [signer1.address, signer2.address, signer3.address];
  const requiredSignatures = 2;
  
  const DeedChainMultiSig = await ethers.getContractFactory("DeedChainMultiSig");
  const multiSig = await DeedChainMultiSig.deploy(signers, requiredSignatures);
  await multiSig.deployed();
  console.log("✅ DeedChainMultiSig deployed to:", multiSig.address);

  const CrossChainBridge = await ethers.getContractFactory("CrossChainBridge");
  const bridge = await CrossChainBridge.deploy(process.env.DEED_NFT_ADDRESS);
  await bridge.deployed();
  console.log("✅ CrossChainBridge deployed to:", bridge.address);

  // Phase 2: Setup and Configuration
  console.log("\n=== PHASE 2: System Configuration ===");
  
  // Setup identity roles
  await identity.grantRole(await identity.KYC_PROVIDER_ROLE(), deployer.address);
  await identity.grantRole(await identity.IDENTITY_MANAGER_ROLE(), deployer.address);
  console.log("✅ Identity roles configured");

  // Setup rewards
  await rewards.grantRole(await rewards.REWARDS_MANAGER_ROLE(), deployer.address);
  console.log("✅ Rewards system configured");

  // Setup bridge
  await bridge.grantRole(await bridge.BRIDGE_OPERATOR_ROLE(), deployer.address);
  await bridge.grantRole(await bridge.VALIDATOR_ROLE(), deployer.address);
  
  // Add supported chains
  await bridge.addSupportedChain(137, process.env.POLYGON_CONTRACT); // Polygon
  await bridge.addSupportedChain(1, process.env.ETHEREUM_CONTRACT); // Ethereum
  console.log("✅ Cross-chain bridge configured");

  console.log("\n🎉 ENTERPRISE SYSTEM DEPLOYED SUCCESSFULLY!");
  console.log("\n📋 ENTERPRISE CONTRACT ADDRESSES:");
  console.log("DeedChainIdentity:", identity.address);
  console.log("DeedChainRewards:", rewards.address);
  console.log("DeedChainMultiSig:", multiSig.address);
  console.log("CrossChainBridge:", bridge.address);

  const enterpriseAddresses = {
    identity: identity.address,
    rewards: rewards.address,
    multiSig: multiSig.address,
    bridge: bridge.address,
  };

  console.log("\n📁 ENTERPRISE CONFIGURATION:");
  console.log(JSON.stringify(enterpriseAddresses, null, 2));
  console.log("MultiSig Signers:", signers);
  console.log("Required Signatures:", requiredSignatures);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Enterprise deployment failed:", error);
    process.exit(1);
  });