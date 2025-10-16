const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DeedChainSecurity", function () {
  let DeedChainSecurity;
  let security;
  let owner, securityManager, user;

  beforeEach(async function () {
    [owner, securityManager, user] = await ethers.getSigners();
    
    DeedChainSecurity = await ethers.getContractFactory("DeedChainSecurity");
    security = await DeedChainSecurity.deploy();
    await security.deployed();

    await security.grantRole(await security.SECURITY_MANAGER_ROLE(), securityManager.address);
  });

  describe("Security Alerts", function () {
    it("Should raise security alert", async function () {
      await expect(
        security.raiseAlert(
          2, // POTENTIAL_FRAUD
          1, // HIGH
          user.address,
          "Suspicious transfer pattern",
          "Evidence IPFS hash"
        )
      ).to.emit(security, "SecurityAlertRaised");
    });

    it("Should blacklist address", async function () {
      await security.connect(securityManager).blacklistAddress(user.address, "Fraudulent activity");
      
      expect(await security.isAddressBlacklisted(user.address)).to.be.true;
    });

    it("Should calculate trust score", async function () {
      // Record positive activity
      await security.connect(securityManager).recordPositiveActivity(user.address);
      
      const trustScore = await security.getTrustScore(user.address);
      expect(trustScore).to.be.gt(0);
    });
  });
});