const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DeedChainGovernance", function () {
  let DeedToken, DeedChainGovernance;
  let deedToken, governance;
  let owner, validator1, validator2;

  beforeEach(async function () {
    [owner, validator1, validator2] = await ethers.getSigners();
    
    // Deploy governance token
    DeedToken = await ethers.getContractFactory("DeedToken");
    deedToken = await DeedToken.deploy();
    await deedToken.deployed();

    // Deploy governance contract
    DeedChainGovernance = await ethers.getContractFactory("DeedChainGovernance");
    governance = await DeedChainGovernance.deploy(deedToken.address);
    await governance.deployed();

    // Transfer tokens to validators for testing
    await deedToken.transfer(validator1.address, ethers.utils.parseEther("5000"));
    await deedToken.transfer(validator2.address, ethers.utils.parseEther("5000"));
  });

  describe("Staking Mechanism", function () {
    it("Should allow validators to stake tokens", async function () {
      const stakeAmount = ethers.utils.parseEther("1000");
      
      await deedToken.connect(validator1).approve(governance.address, stakeAmount);
      
      await expect(
        governance.connect(validator1).stake(stakeAmount)
      ).to.emit(governance, "Staked");
      
      expect(await governance.getValidatorStatus(validator1.address)).to.be.true;
    });

    it("Should calculate rewards correctly", async function () {
      const stakeAmount = ethers.utils.parseEther("1000");
      
      await deedToken.connect(validator1).approve(governance.address, stakeAmount);
      await governance.connect(validator1).stake(stakeAmount);
      
      // Fast forward 30 days
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      const rewards = await governance.calculateRewards(validator1.address);
      expect(rewards).to.be.gt(0);
    });

    it("Should allow claiming rewards", async function () {
      const stakeAmount = ethers.utils.parseEther("1000");
      
      await deedToken.connect(validator1).approve(governance.address, stakeAmount);
      await governance.connect(validator1).stake(stakeAmount);
      
      // Fast forward 30 days
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      await expect(
        governance.connect(validator1).claimRewards()
      ).to.emit(governance, "RewardsClaimed");
    });
  });
});