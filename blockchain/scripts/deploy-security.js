const { ethers } = require("hardhat");

async function main() {
  const [deployer, securityManager, recoveryAgent] = await ethers.getSigners();
  
  console.log("Deploying Security & Backup System with account:", deployer.address);

  console.log("\n1. Deploying DeedChainSecurity...");
  const DeedChainSecurity = await ethers.getContractFactory("DeedChainSecurity");
  const security = await DeedChainSecurity.deploy();
  await security.deployed();
  console.log("✅ DeedChainSecurity deployed to:", security.address);

  console.log("\n2. Deploying DeedChainBackup...");
  const DeedChainBackup = await ethers.getContractFactory("DeedChainBackup");
  const backup = await DeedChainBackup.deploy();
  await backup.deployed();
  console.log("✅ DeedChainBackup deployed to:", backup.address);

  console.log("\n3. Deploying DeedChainAPI...");
  const DeedChainAPI = await ethers.getContractFactory("DeedChainAPI");
  const api = await DeedChainAPI.deploy();
  await api.deployed();
  console.log("✅ DeedChainAPI deployed to:", api.address);

  // Setup roles
  console.log("\n4. Configuring Security Roles...");
  
  await security.grantRole(await security.SECURITY_MANAGER_ROLE(), securityManager.address);
  await security.grantRole(await security.MONITOR_ROLE(), securityManager.address);
  
  await backup.grantRole(await backup.BACKUP_OPERATOR_ROLE(), securityManager.address);
  await backup.grantRole(await backup.RECOVERY_AGENT_ROLE(), recoveryAgent.address);
  
  await api.grantRole(await api.API_MANAGER_ROLE(), securityManager.address);
  
  console.log("✅ Security roles configured");

  console.log("\n🎉 SECURITY SYSTEM DEPLOYED SUCCESSFULLY!");
  console.log("\n📋 SECURITY CONTRACT ADDRESSES:");
  console.log("DeedChainSecurity:", security.address);
  console.log("DeedChainBackup:", backup.address);
  console.log("DeedChainAPI:", api.address);

  const securityAddresses = {
    security: security.address,
    backup: backup.address,
    api: api.address,
  };

  console.log("\n📁 SECURITY CONFIGURATION:");
  console.log(JSON.stringify(securityAddresses, null, 2));
  console.log("Security Manager:", securityManager.address);
  console.log("Recovery Agent:", recoveryAgent.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Security deployment failed:", error);
    process.exit(1);
  });