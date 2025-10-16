const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DeedNFT", function () {
  let DeedNFT;
  let deedNFT;
  let owner;
  let registrar;
  let verifier;
  let user;

  beforeEach(async function () {
    [owner, registrar, verifier, user] = await ethers.getSigners();
    
    DeedNFT = await ethers.getContractFactory("DeedNFT");
    deedNFT = await DeedNFT.deploy();
    await deedNFT.deployed();

    // Setup roles
    await deedNFT.grantRole(await deedNFT.REGISTRAR_ROLE(), registrar.address);
    await deedNFT.grantRole(await deedNFT.VERIFIER_ROLE(), verifier.address);
  });

  describe("Property Registration", function () {
    it("Should register a new property", async function () {
      const ipfsHash = "QmTestHash123";
      const geoCoordinates = "1.2345,6.7890";
      const areaSize = 1000;
      const surveyNumber = "SURV-001";

      await deedNFT.connect(registrar).registerProperty(
        user.address,
        ipfsHash,
        geoCoordinates,
        areaSize,
        surveyNumber
      );

      const tokenId = 1;
      expect(await deedNFT.ownerOf(tokenId)).to.equal(user.address);
      expect(await deedNFT.tokenURI(tokenId)).to.equal(ipfsHash);
      
      const propertyInfo = await deedNFT.getPropertyInfo(tokenId);
      expect(propertyInfo.geoCoordinates).to.equal(geoCoordinates);
      expect(propertyInfo.areaSize).to.equal(areaSize);
      expect(propertyInfo.surveyNumber).to.equal(surveyNumber);
      expect(propertyInfo.isVerified).to.be.false;
    });

    it("Should fail if non-registrar tries to register", async function () {
      await expect(
        deedNFT.connect(user).registerProperty(
          user.address,
          "QmTest",
          "1,1",
          100,
          "SURV-001"
        )
      ).to.be.reverted;
    });
  });

  describe("Property Verification", function () {
    beforeEach(async function () {
      await deedNFT.connect(registrar).registerProperty(
        user.address,
        "QmTest",
        "1,1",
        100,
        "SURV-001"
      );
    });

    it("Should verify a property", async function () {
      const tokenId = 1;
      await deedNFT.connect(verifier).verifyProperty(tokenId);
      
      const propertyInfo = await deedNFT.getPropertyInfo(tokenId);
      expect(propertyInfo.isVerified).to.be.true;
      expect(propertyInfo.verifiedBy).to.equal(verifier.address);
    });

    it("Should fail if non-verifier tries to verify", async function () {
      await expect(
        deedNFT.connect(user).verifyProperty(1)
      ).to.be.reverted;
    });
  });
});