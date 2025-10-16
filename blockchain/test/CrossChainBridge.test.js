const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrossChainBridge", function () {
  let DeedNFT, CrossChainBridge;
  let deedNFT, bridge;
  let owner, user, validator;

  beforeEach(async function () {
    [owner, user, validator] = await ethers.getSigners();
    
    DeedNFT = await ethers.getContractFactory("DeedNFT");
    deedNFT = await DeedNFT.deploy();
    await deedNFT.deployed();

    CrossChainBridge = await ethers.getContractFactory("CrossChainBridge");
    bridge = await CrossChainBridge.deploy(deedNFT.address);
    await bridge.deployed();

    await deedNFT.grantRole(await deedNFT.REGISTRAR_ROLE(), owner.address);
    await deedNFT.grantRole(await deedNFT.VERIFIER_ROLE(), owner.address);
    
    await bridge.grantRole(await bridge.VALIDATOR_ROLE(), validator.address);
  });

  describe("Bridge Operations", function () {
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

    it("Should create bridge request", async function () {
      const bridgeFee = await bridge.estimateBridgeFee(137); // Polygon
      
      await deedNFT.connect(user).approve(bridge.address, 1);
      
      await expect(
        bridge.connect(user).createBridgeRequest(1, 137, ethers.constants.AddressZero, {
          value: bridgeFee
        })
      ).to.emit(bridge, "BridgeRequestCreated");
    });

    it("Should confirm bridge request", async function () {
      // Create request first
      const bridgeFee = await bridge.estimateBridgeFee(137);
      await deedNFT.connect(user).approve(bridge.address, 1);
      await bridge.connect(user).createBridgeRequest(1, 137, ethers.constants.AddressZero, {
        value: bridgeFee
      });

      const txHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-tx"));
      
      await expect(
        bridge.connect(validator).confirmBridgeRequest(1, txHash)
      ).to.emit(bridge, "BridgeRequestConfirmed");
    });
  });
});