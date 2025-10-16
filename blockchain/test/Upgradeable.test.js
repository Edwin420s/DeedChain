const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("DeedChain Upgradeable Contracts", function () {
  let DeedNFTUpgradeable;
  let deedNFT, deployer, user;

  beforeEach(async function () {
    [deployer, user] = await ethers.getSigners();
    
    DeedNFTUpgradeable = await ethers.getContractFactory("DeedNFTUpgradeable");
  });

  it("Should deploy upgradeable contract", async function () {
    deedNFT = await upgrades.deployProxy(DeedNFTUpgradeable, [], {
      initializer: "initialize",
      kind: "uups"
    });
    await deedNFT.deployed();

    expect(await deedNFT.getImplementation()).to.not.equal(ethers.constants.AddressZero);
  });

  it("Should upgrade contract", async function () {
    // Deploy V1
    deedNFT = await upgrades.deployProxy(DeedNFTUpgradeable, [], {
      initializer: "initialize",
      kind: "uups"
    });
    
    // Deploy V2
    const DeedNFTUpgradeableV2 = await ethers.getContractFactory("DeedNFTUpgradeableV2");
    const deedNFTV2 = await upgrades.upgradeProxy(deedNFT.address, DeedNFTUpgradeableV2);
    
    expect(await deedNFTV2.version()).to.equal("2.0.0");
  });

  it("Should maintain state after upgrade", async function () {
    // Deploy and use V1
    deedNFT = await upgrades.deployProxy(DeedNFTUpgradeable, [], {
      initializer: "initialize",
      kind: "uups"
    });
    
    await deedNFT.grantRole(await deedNFT.REGISTRAR_ROLE(), deployer.address);
    await deedNFT.registerProperty(user.address, "QmTest", "1,1", 1000, "SURV-001");
    
    // Upgrade to V2
    const DeedNFTUpgradeableV2 = await ethers.getContractFactory("DeedNFTUpgradeableV2");
    const deedNFTV2 = await upgrades.upgradeProxy(deedNFT.address, DeedNFTUpgradeableV2);
    
    // Verify state is maintained
    expect(await deedNFTV2.ownerOf(1)).to.equal(user.address);
  });
});