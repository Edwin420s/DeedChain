const { ethers } = require("hardhat");

async function main() {
  const [deployer, validator1, validator2, user1, user2] = await ethers.getSigners();
  
  console.log("Deploying mock data with accounts:");
  console.log("Deployer:", deployer.address);
  console.log("Validator 1:", validator1.address);
  console.log("Validator 2:", validator2.address);
  console.log("User 1:", user1.address);
  console.log("User 2:", user2.address);

  const CONTRACT_ADDRESSES = {
    deedNFT: process.env.DEED_NFT_ADDRESS,
    landRegistry: process.env.LAND_REGISTRY_ADDRESS,
    tokenizationManager: process.env.TOKENIZATION_MANAGER_ADDRESS,
    daoVerification: process.env.DAO_VERIFICATION_ADDRESS
  };

  const deedNFT = await ethers.getContractAt("DeedNFT", CONTRACT_ADDRESSES.deedNFT);
  const landRegistry = await ethers.getContractAt("LandRegistry", CONTRACT_ADDRESSES.landRegistry);
  const tokenizationManager = await ethers.getContractAt("TokenizationManager", CONTRACT_ADDRESSES.tokenizationManager);
  const daoVerification = await ethers.getContractAt("DAOVerification", CONTRACT_ADDRESSES.daoVerification);

  console.log("Deploying mock properties...");

  // Mock property data
  const mockProperties = [
    {
      to: user1.address,
      ipfsHash: "QmProperty1Hash123456789",
      geoCoordinates: "-1.2920659,36.8219462", // Nairobi coordinates
      areaSize: 2500, // square meters
      surveyNumber: "NBI-001-2024"
    },
    {
      to: user2.address,
      ipfsHash: "QmProperty2Hash987654321",
      geoCoordinates: "-1.303611,36.847222", // Thika coordinates
      areaSize: 5000,
      surveyNumber: "THK-002-2024"
    }
  ];

  // Register properties
  for (let i = 0; i < mockProperties.length; i++) {
    const prop = mockProperties[i];
    const tx = await deedNFT.registerProperty(
      prop.to,
      prop.ipfsHash,
      prop.geoCoordinates,
      prop.areaSize,
      prop.surveyNumber
    );
    await tx.wait();
    console.log(`✅ Registered property ${i + 1} for ${prop.to}`);
  }

  // Propose verifications
  console.log("Proposing verifications...");
  for (let i = 1; i <= mockProperties.length; i++) {
    const proposeTx = await daoVerification.proposeVerification(i);
    await proposeTx.wait();
    console.log(`✅ Proposed verification for property ${i}`);
  }

  // Vote on verifications
  console.log("Simulating DAO votes...");
  for (let i = 1; i <= mockProperties.length; i++) {
    // Validator 1 votes yes
    const vote1Tx = await daoVerification.connect(validator1).voteOnVerification(i, true);
    await vote1Tx.wait();
    
    // Validator 2 votes yes
    const vote2Tx = await daoVerification.connect(validator2).voteOnVerification(i, true);
    await vote2Tx.wait();
    
    console.log(`✅ Validators voted for property ${i}`);
  }

  // Execute verifications
  console.log("Executing verifications...");
  for (let i = 1; i <= mockProperties.length; i++) {
    const executeTx = await daoVerification.executeVerification(i);
    await executeTx.wait();
    console.log(`✅ Executed verification for property ${i}`);
  }

  // Simulate transfer request
  console.log("Simulating transfer request...");
  const transferTx = await landRegistry.connect(user1).initiateTransfer(1, user2.address);
  const receipt = await transferTx.wait();
  console.log("✅ Transfer initiated from user1 to user2");

  console.log("Mock data deployment completed!");
  console.log("\nSummary:");
  console.log("- 2 properties registered");
  console.log("- 2 properties verified by DAO");
  console.log("- 1 transfer initiated");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Mock data deployment failed:", error);
    process.exit(1);
  });