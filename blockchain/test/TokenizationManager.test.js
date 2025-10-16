const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenizationManager", function () {
  let DeedNFT, TokenizationManager;
  let deedNFT, tokenizationManager;
  let owner, tokenizer, user;

  beforeEach(async function () {
    [owner, tokenizer, user] = await ethers.getSigners();
    
    DeedNFT = await ethers.getContractFactory("DeedNFT");
    deedNFT = await DeedNFT.deploy();
    await deedNFT.deployed();

    TokenizationManager = await ethers.getContractFactory("TokenizationManager");
    tokenizationManager = await TokenizationManager.deploy(deedNFT.address);
    await tokenizationManager.deployed();

    await deedNFT.grantRole(await deedNFT.REGISTRAR_ROLE(), owner.address);
    await deedNFT.grantRole(await deedNFT.VERIFIER_ROLE(), owner.address);
    await tokenizationManager.grantRole(await tokenizationManager.TOKENIZER_ROLE(), tokenizer.address);
  });

  describe("Property Tokenization", function () {
    beforeEach(async function () {
      // Register and verify a property
      await deedNFT.registerProperty(
        user.address,
        "QmTestHash",
        "1.2345,6.7890",
        1000,
        "SURV-001"
      );
      await deedNFT.verifyProperty(1);
    });

    it("Should lock NFT for tokenization", async function () {
      await deedNFT.connect(user).approve(tokenizationManager.address, 1);
      await tokenizationManager.connect(user).lockNFTForTokenization(1);
      
      expect(await deedNFT.ownerOf(1)).to.equal(tokenizationManager.address);
    });

    it("Should tokenize locked property", async function () {
      // Lock NFT first
      await deedNFT.connect(user).approve(tokenizationManager.address, 1);
      await tokenizationManager.connect(user).lockNFTForTokenization(1);

      const tokenName = "LandShare Property 1";
      const tokenSymbol = "LSP1";
      const totalShares = 1000000;

      await expect(
        tokenizationManager.connect(tokenizer).tokenizeProperty(
          1,
          tokenName,
          tokenSymbol,
          totalShares
        )
      ).to.emit(tokenizationManager, "PropertyTokenized");
    });

    it("Should distribute shares to recipients", async function () {
      // Complete tokenization setup
      await deedNFT.connect(user).approve(tokenizationManager.address, 1);
      await tokenizationManager.connect(user).lockNFTForTokenization(1);
      
      await tokenizationManager.connect(tokenizer).tokenizeProperty(
        1,
        "Test Property",
        "TEST",
        1000000
      );

      const recipients = [user.address, owner.address];
      const amounts = [500000, 500000]; // 50% each

      await tokenizationManager.connect(tokenizer).distributeShares(1, recipients, amounts);
      
      const tokenizedProperty = await tokenizationManager.getTokenizedProperty(1);
      const landShareToken = await ethers.getContractAt("LandShareToken", tokenizedProperty.landShareToken);
      
      expect(await landShareToken.balanceOf(user.address)).to.equal(500000);
      expect(await landShareToken.balanceOf(owner.address)).to.equal(500000);
    });
  });
});