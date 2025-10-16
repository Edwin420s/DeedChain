const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LandRegistry", function () {
  let DeedNFT, LandRegistry;
  let deedNFT, landRegistry;
  let owner, approver, user1, user2;

  beforeEach(async function () {
    [owner, approver, user1, user2] = await ethers.getSigners();
    
    // Deploy DeedNFT
    DeedNFT = await ethers.getContractFactory("DeedNFT");
    deedNFT = await DeedNFT.deploy();
    await deedNFT.deployed();

    // Deploy LandRegistry
    LandRegistry = await ethers.getContractFactory("LandRegistry");
    landRegistry = await LandRegistry.deploy(deedNFT.address);
    await landRegistry.deployed();

    // Setup roles
    await deedNFT.grantRole(await deedNFT.REGISTRAR_ROLE(), owner.address);
    await deedNFT.grantRole(await deedNFT.VERIFIER_ROLE(), owner.address);
    await landRegistry.grantRole(await landRegistry.TRANSFER_APPROVER_ROLE(), approver.address);
  });

  describe("Transfer Management", function () {
    beforeEach(async function () {
      // Register and verify a property
      await deedNFT.registerProperty(
        user1.address,
        "QmTestHash",
        "1.2345,6.7890",
        1000,
        "SURV-001"
      );
      await deedNFT.verifyProperty(1);
    });

    it("Should initiate transfer request", async function () {
      await expect(
        landRegistry.connect(user1).initiateTransfer(1, user2.address)
      ).to.emit(landRegistry, "TransferInitiated");
    });

    it("Should approve transfer request", async function () {
      const transferTx = await landRegistry.connect(user1).initiateTransfer(1, user2.address);
      const receipt = await transferTx.wait();
      
      // Extract requestId from events
      const event = receipt.events.find(e => e.event === "TransferInitiated");
      const requestId = event.args.requestId;

      await expect(
        landRegistry.connect(approver).approveTransfer(requestId)
      ).to.emit(landRegistry, "TransferApproved");
    });

    it("Should complete transfer after approval", async function () {
      const transferTx = await landRegistry.connect(user1).initiateTransfer(1, user2.address);
      const receipt = await transferTx.wait();
      
      const event = receipt.events.find(e => e.event === "TransferInitiated");
      const requestId = event.args.requestId;

      await landRegistry.connect(approver).approveTransfer(requestId);
      
      await expect(
        landRegistry.connect(user1).executeTransfer(requestId)
      ).to.emit(landRegistry, "TransferCompleted")
       .to.emit(deedNFT, "Transfer");
    });

    it("Should fail if non-owner initiates transfer", async function () {
      await expect(
        landRegistry.connect(user2).initiateTransfer(1, user1.address)
      ).to.be.revertedWith("Not property owner");
    });
  });
});