const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PropertyMarketplace", function () {
  let DeedNFT, DeedToken, PropertyMarketplace;
  let deedNFT, deedToken, propertyMarketplace;
  let owner, seller, buyer;

  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();
    
    // Deploy DeedToken
    DeedToken = await ethers.getContractFactory("DeedToken");
    deedToken = await DeedToken.deploy();
    await deedToken.deployed();

    // Deploy DeedNFT
    DeedNFT = await ethers.getContractFactory("DeedNFT");
    deedNFT = await DeedNFT.deploy();
    await deedNFT.deployed();

    // Deploy PropertyMarketplace
    PropertyMarketplace = await ethers.getContractFactory("PropertyMarketplace");
    propertyMarketplace = await PropertyMarketplace.deploy(
      deedNFT.address,
      ethers.constants.AddressZero, // tokenization manager not needed for basic tests
      deedToken.address,
      owner.address
    );
    await propertyMarketplace.deployed();

    // Setup roles and tokens
    await deedNFT.grantRole(await deedNFT.REGISTRAR_ROLE(), owner.address);
    await deedNFT.grantRole(await deedNFT.VERIFIER_ROLE(), owner.address);
    
    // Transfer tokens to buyer for testing
    await deedToken.transfer(buyer.address, ethers.utils.parseEther("10000"));
  });

  describe("Fixed Price Listings", function () {
    beforeEach(async function () {
      // Register and verify a property
      await deedNFT.registerProperty(
        seller.address,
        "QmTestHash",
        "1.2345,6.7890",
        1000,
        "SURV-001"
      );
      await deedNFT.verifyProperty(1);
    });

    it("Should create fixed price listing", async function () {
      await deedNFT.connect(seller).approve(propertyMarketplace.address, 1);
      
      await expect(
        propertyMarketplace.connect(seller).createListing(
          0, // FULL_PROPERTY
          0, // FIXED_PRICE
          1, // propertyId
          1, // quantity
          ethers.utils.parseEther("1000"),
          7 * 24 * 60 * 60 // 7 days
        )
      ).to.emit(propertyMarketplace, "ListingCreated");
    });

    it("Should allow purchase of fixed price listing", async function () {
      // Create listing
      await deedNFT.connect(seller).approve(propertyMarketplace.address, 1);
      await propertyMarketplace.connect(seller).createListing(
        0, 0, 1, 1, ethers.utils.parseEther("1000"), 7 * 24 * 60 * 60
      );

      // Approve tokens for buyer
      await deedToken.connect(buyer).approve(propertyMarketplace.address, ethers.utils.parseEther("1000"));
      
      await expect(
        propertyMarketplace.connect(buyer).purchaseListing(1)
      ).to.emit(propertyMarketplace, "ListingSold");
    });
  });
});