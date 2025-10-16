const { run } = require("hardhat");

async function main() {
  const contractAddresses = {
    deedNFT: process.env.DEED_NFT_ADDRESS,
    landRegistry: process.env.LAND_REGISTRY_ADDRESS,
    tokenizationManager: process.env.TOKENIZATION_MANAGER_ADDRESS,
    daoVerification: process.env.DAO_VERIFICATION_ADDRESS,
    deedToken: process.env.DEED_TOKEN_ADDRESS,
    deedChainGovernance: process.env.DEED_CHAIN_GOVERNANCE_ADDRESS,
    propertyValuation: process.env.PROPERTY_VALUATION_ADDRESS,
    propertyAuction: process.env.PROPERTY_AUCTION_ADDRESS,
    propertyInsurance: process.env.PROPERTY_INSURANCE_ADDRESS
  };

  console.log("Verifying contracts on Etherscan...");

  // Verify DeedNFT
  try {
    await run("verify:verify", {
      address: contractAddresses.deedNFT,
      constructorArguments: [],
    });
    console.log("✅ DeedNFT verified");
  } catch (error) {
    console.log("❌ DeedNFT verification failed:", error.message);
  }

  // Verify LandRegistry
  try {
    await run("verify:verify", {
      address: contractAddresses.landRegistry,
      constructorArguments: [contractAddresses.deedNFT],
    });
    console.log("✅ LandRegistry verified");
  } catch (error) {
    console.log("❌ LandRegistry verification failed:", error.message);
  }

  // Verify other contracts similarly...
  console.log("Contract verification process completed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Verification failed:", error);
    process.exit(1);
  });