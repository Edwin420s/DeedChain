const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DeedChain Integration", function () {
  let DeedNFT, LandRegistry, TokenizationManager, DAOVerification;
  let deedNFT, landRegistry, tokenizationManager, daoVerification;
  let owner, user1, user2, validator;

  beforeEach(async function () {
    [owner, user1, user2, validator] = await ethers.getSigners();
    
    // Deploy all core contracts
    const DeedNFT = await ethers.getContractFactory("DeedNFT");
    deedNFT = await DeedNFT.deploy();
    await deedNFT.deployed();

    const LandRegistry = await ethers.getContractFactory("LandRegistry");
    landRegistry = await LandRegistry.deploy(deedNFT.address);
    await landRegistry.deployed();

    const TokenizationManager = await ethers.getContractFactory("TokenizationManager");
    tokenizationManager = await TokenizationManager.deploy(deedNFT.address);
    await tokenizationManager.deployed();

    const DAOVerification = await ethers.getContractFactory("DAOVerification");
    daoVerification = await DAOVerification.deploy(deedNFT.address);
    await daoVerification.deployed();

    // Setup roles
    await deedNFT.grantRole(await deedNFT.REGISTRAR_ROLE(), owner.address);
    await deedNFT.grantRole(await deedNFT.VERIFIER_ROLE(), daoVerification.address);
    await daoVerification.addValidator(validator.address);
  });

  it("Should complete full property lifecycle", async function () {
    // 1. Register property
    await deedNFT.registerProperty(
      user1.address,
      "QmTestHash",
      "1.2345,6.7890",
      1000,
      "SURV-001"
    );

    // 2. Propose verification
    await daoVerification.connect(validator).proposeVerification(1);

    // 3. Vote and verify
    await daoVerification.connect(validator).voteOnVerification(1, true);
    
    // Fast forward time
    await ethers.provider.send("evm_increaseTime", [4 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    // 4. Execute verification
    await daoVerification.executeVerification(1);

    // 5. Initiate transfer
    await landRegistry.connect(user1).initiateTransfer(1, user2.address);

    // 6. Verify property is verified and transferable
    const propertyInfo = await deedNFT.getPropertyInfo(1);
    expect(propertyInfo.isVerified).to.be.true;
  });

  it("Should handle tokenization workflow", async function () {
    // Register and verify property first
    await deedNFT.registerProperty(user1.address, "QmTest", "1,1", 1000, "SURV-001");
    await deedNFT.verifyProperty(1);

    // Tokenize property
    await deedNFT.connect(user1).approve(tokenizationManager.address, 1);
    await tokenizationManager.connect(user1).lockNFTForTokenization(1);
    
    await tokenizationManager.tokenizeProperty(
      1,
      "Test Property Shares",
      "TPS",
      1000000
    );

    const tokenizedProperty = await tokenizationManager.getTokenizedProperty(1);
    expect(tokenizedProperty.isActive).to.be.true;
  });
});