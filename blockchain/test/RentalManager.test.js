const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RentalManager", function () {
  let DeedNFT, MockStableToken, RentalManager;
  let deedNFT, stableToken, rentalManager;
  let owner, landlord, tenant;

  beforeEach(async function () {
    [owner, landlord, tenant] = await ethers.getSigners();
    
    // Deploy Mock Stable Token
    const MockStableToken = await ethers.getContractFactory("MockStableToken");
    stableToken = await MockStableToken.deploy();
    await stableToken.deployed();

    // Deploy DeedNFT
    const DeedNFT = await ethers.getContractFactory("DeedNFT");
    deedNFT = await DeedNFT.deploy();
    await deedNFT.deployed();

    // Deploy RentalManager
    const RentalManager = await ethers.getContractFactory("RentalManager");
    rentalManager = await RentalManager.deploy(deedNFT.address, stableToken.address);
    await rentalManager.deployed();

    // Setup roles and tokens
    await deedNFT.grantRole(await deedNFT.REGISTRAR_ROLE(), owner.address);
    await deedNFT.grantRole(await deedNFT.VERIFIER_ROLE(), owner.address);
    
    // Transfer stable tokens to tenant for testing
    await stableToken.transfer(tenant.address, ethers.utils.parseEther("10000"));
  });

  describe("Rental Agreements", function () {
    beforeEach(async function () {
      // Register and verify a property
      await deedNFT.registerProperty(
        landlord.address,
        "QmTestHash",
        "1.2345,6.7890",
        1000,
        "SURV-001"
      );
      await deedNFT.verifyProperty(1);
    });

    it("Should create rental agreement", async function () {
      const monthlyRent = ethers.utils.parseEther("100");
      const securityDeposit = ethers.utils.parseEther("200");
      const startDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
      const endDate = startDate + 90 * 86400; // 90 days
      
      // Approve security deposit
      await stableToken.connect(tenant).approve(rentalManager.address, securityDeposit);
      
      await expect(
        rentalManager.connect(landlord).createRentalAgreement(
          1,
          tenant.address,
          monthlyRent,
          securityDeposit,
          startDate,
          endDate
        )
      ).to.emit(rentalManager, "RentalAgreementCreated");
    });

    it("Should process rental payments", async function () {
      // Create agreement first
      const monthlyRent = ethers.utils.parseEther("100");
      const securityDeposit = ethers.utils.parseEther("200");
      const startDate = Math.floor(Date.now() / 1000) - 86400; // Yesterday
      const endDate = startDate + 90 * 86400;
      
      await stableToken.connect(tenant).approve(rentalManager.address, securityDeposit + monthlyRent * 3);
      await rentalManager.connect(landlord).createRentalAgreement(
        1, tenant.address, monthlyRent, securityDeposit, startDate, endDate
      );
      
      // Activate agreement
      await rentalManager.connect(landlord).activateRentalAgreement(1);
      
      // Make payment
      await stableToken.connect(tenant).approve(rentalManager.address, monthlyRent);
      
      await expect(
        rentalManager.connect(tenant).makeRentalPayment(1)
      ).to.emit(rentalManager, "RentalPaymentMade");
    });
  });
});