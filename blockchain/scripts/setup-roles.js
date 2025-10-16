const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Setting up roles with account:", deployer.address);

  // Contract addresses (replace with actual deployed addresses)
  const CONTRACT_ADDRESSES = {
    deedNFT: process.env.DEED_NFT_ADDRESS,
    landRegistry: process.env.LAND_REGISTRY_ADDRESS,
    tokenizationManager: process.env.TOKENIZATION_MANAGER_ADDRESS,
    daoVerification: process.env.DAO_VERIFICATION_ADDRESS
  };

  const deedNFT = await ethers.getContractAt("DeedNFT", CONTRACT_ADDRESSES.deedNFT);
  const landRegistry = await ethers.getContractAt("LandRegistry", CONTRACT_ADDRESSES.landRegistry);
  const daoVerification = await ethers.getContractAt("DAOVerification", CONTRACT_ADDRESSES.daoVerification);

  // Setup role relationships
  console.log("Setting up role relationships...");

  // Grant VERIFIER_ROLE to DAOVerification contract
  const verifierTx = await deedNFT.grantRole(await deedNFT.VERIFIER_ROLE(), daoVerification.address);
  await verifierTx.wait();
  console.log("✅ Granted VERIFIER_ROLE to DAOVerification");

  // Grant REGISTRAR_ROLE to LandRegistry
  const registrarTx = await deedNFT.grantRole(await deedNFT.REGISTRAR_ROLE(), landRegistry.address);
  await registrarTx.wait();
  console.log("✅ Granted REGISTRAR_ROLE to LandRegistry");

  // Add initial validators to DAO
  const validators = process.env.INITIAL_VALIDATORS ? process.env.INITIAL_VALIDATORS.split(',') : [deployer.address];
  
  for (const validator of validators) {
    const addValidatorTx = await daoVerification.addValidator(validator);
    await addValidatorTx.wait();
    console.log(`✅ Added validator: ${validator}`);
  }

  console.log("Role setup completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Setup failed:", error);
    process.exit(1);
  });