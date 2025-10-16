const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DAOVerification", function () {
  let DeedNFT, DAOVerification;
  let deedNFT, daoVerification;
  let owner, validator1, validator2, user;

  beforeEach(async function () {
    [owner, validator1, validator2, user] = await ethers.getSigners();
    
    DeedNFT = await ethers.getContractFactory("DeedNFT");
    deedNFT = await DeedNFT.deploy();
    await deedNFT.deployed();

    DAOVerification = await ethers.getContractFactory("DAOVerification");
    daoVerification = await DAOVerification.deploy(deedNFT.address);
    await daoVerification.deployed();

    await deedNFT.grantRole(await deedNFT.REGISTRAR_ROLE(), owner.address);
    await deedNFT.grantRole(await deedNFT.VERIFIER_ROLE(), daoVerification.address);
    
    // Add validators
    await daoVerification.addValidator(validator1.address);
    await daoVerification.addValidator(validator2.address);
  });

  describe("DAO Verification Process", function () {
    beforeEach(async function () {
      // Register a property
      await deedNFT.registerProperty(
        user.address,
        "QmTestHash",
        "1.2345,6.7890",
        1000,
        "SURV-001"
      );
    });

    it("Should propose verification", async function () {
      await expect(
        daoVerification.connect(validator1).proposeVerification(1)
      ).to.emit(daoVerification, "VerificationProposed");
    });

    it("Should allow validators to vote", async function () {
      await daoVerification.connect(validator1).proposeVerification(1);
      
      await expect(
        daoVerification.connect(validator1).voteOnVerification(1, true)
      ).to.emit(daoVerification, "VoteCast");
      
      await expect(
        daoVerification.connect(validator2).voteOnVerification(1, true)
      ).to.emit(daoVerification, "VoteCast");
    });

    it("Should execute verification after successful vote", async function () {
      await daoVerification.connect(validator1).proposeVerification(1);
      await daoVerification.connect(validator1).voteOnVerification(1, true);
      await daoVerification.connect(validator2).voteOnVerification(1, true);
      
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [4 * 24 * 60 * 60]); // 4 days
      await ethers.provider.send("evm_mine");
      
      await expect(
        daoVerification.executeVerification(1)
      ).to.emit(daoVerification, "VerificationExecuted")
       .to.emit(deedNFT, "PropertyVerified");
    });

    it("Should fail if non-validator tries to vote", async function () {
      await daoVerification.connect(validator1).proposeVerification(1);
      
      await expect(
        daoVerification.connect(user).voteOnVerification(1, true)
      ).to.be.reverted;
    });
  });
});