const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PropertyAuction", function () {
  let DeedNFT, PropertyAuction;
  let deedNFT, propertyAuction;
  let owner, seller, bidder1, bidder2;

  beforeEach(async function () {
    [owner, seller, bidder1, bidder2] = await ethers.getSigners();
    
    DeedNFT = await ethers.getContractFactory("DeedNFT");
    deedNFT = await DeedNFT.deploy();
    await deedNFT.deployed();

    PropertyAuction = await ethers.getContractFactory("PropertyAuction");
    propertyAuction = await PropertyAuction.deploy(deedNFT.address);
    await propertyAuction.deployed();

    await deedNFT.grantRole(await deedNFT.REGISTRAR_ROLE(), owner.address);
    await deedNFT.grantRole(await deedNFT.VERIFIER_ROLE(), owner.address);
  });

  describe("Auction Creation", function () {
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

    it("Should create a new auction", async function () {
      await deedNFT.connect(seller).approve(propertyAuction.address, 1);
      
      await expect(
        propertyAuction.connect(seller).createAuction(
          1,
          0, // FULL_PROPERTY
          ethers.utils.parseEther("1.0"),
          ethers.utils.parseEther("0.8"),
          ethers.constants.AddressZero,
          0
        )
      ).to.emit(propertyAuction, "AuctionCreated");
    });

    it("Should allow bidding on active auction", async function () {
      await deedNFT.connect(seller).approve(propertyAuction.address, 1);
      await propertyAuction.connect(seller).createAuction(
        1,
        0,
        ethers.utils.parseEther("1.0"),
        ethers.utils.parseEther("0.8"),
        ethers.constants.AddressZero,
        0
      );

      await expect(
        propertyAuction.connect(bidder1).placeBid(1, { value: ethers.utils.parseEther("1.0") })
      ).to.emit(propertyAuction, "BidPlaced");
    });
  });
});