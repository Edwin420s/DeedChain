const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PropertyInsurance", function () {
  let DeedNFT, PropertyInsurance;
  let deedNFT, propertyInsurance;
  let owner, insurer, adjuster, propertyOwner;

  beforeEach(async function () {
    [owner, insurer, adjuster, propertyOwner] = await ethers.getSigners();
    
    DeedNFT = await ethers.getContractFactory("DeedNFT");
    deedNFT = await DeedNFT.deploy();
    await deedNFT.deployed();

    PropertyInsurance = await ethers.getContractFactory("PropertyInsurance");
    propertyInsurance = await PropertyInsurance.deploy(deedNFT.address);
    await propertyInsurance.deployed();

    await deedNFT.grantRole(await deedNFT.REGISTRAR_ROLE(), owner.address);
    await deedNFT.grantRole(await deedNFT.VERIFIER_ROLE(), owner.address);
    
    await propertyInsurance.grantRole(await propertyInsurance.INSURER_ROLE(), insurer.address);
    await propertyInsurance.grantRole(await propertyInsurance.CLAIM_ADJUSTER_ROLE(), adjuster.address);
  });

  describe("Insurance Policies", function () {
    beforeEach(async function () {
      // Register and verify a property
      await deedNFT.registerProperty(
        propertyOwner.address,
        "QmTestHash",
        "1.2345,6.7890",
        1000,
        "SURV-001"
      );
      await deedNFT.verifyProperty(1);
    });

    it("Should issue insurance policy", async function () {
      const coverageAmount = ethers.utils.parseEther("1000");
      const premium = await propertyInsurance.calculatePremium(coverageAmount);
      
      await expect(
        propertyInsurance.connect(propertyOwner).issuePolicy(1, coverageAmount, { value: premium })
      ).to.emit(propertyInsurance, "PolicyIssued");
    });

    it("Should allow filing claims", async function () {
      const coverageAmount = ethers.utils.parseEther("1000");
      const premium = await propertyInsurance.calculatePremium(coverageAmount);
      
      await propertyInsurance.connect(propertyOwner).issuePolicy(1, coverageAmount, { value: premium });
      
      await expect(
        propertyInsurance.connect(propertyOwner).fileClaim(1, coverageAmount, "Test claim")
      ).to.emit(propertyInsurance, "ClaimFiled");
    });
  });
});