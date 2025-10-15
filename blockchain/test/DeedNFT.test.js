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

    // Grant roles
    const REGISTRAR_ROLE = await deedNFT.REGISTRAR_ROLE();
    const VERIFIER_ROLE = await deedNFT.VERIFIER_ROLE();

    await deedNFT.grantRole(REGISTRAR_ROLE, registrar.address);
    await deedNFT.grantRole(VERIFIER_ROLE, verifier.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await deedNFT.hasRole(await deedNFT.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
    });

    it("Should set the right name and symbol", async function () {
      expect(await deedNFT.name()).to.equal("DeedChain Land Deed");
      expect(await deedNFT.symbol()).to.equal("DEED");
    });
  });

  describe("Minting", function () {
    it("Should mint a new deed", async function () {
      const ipfsHash = "QmTestHash123";
      const location = "Nairobi, Kenya";
      const areaSize = 1000;

      await expect(
        deedNFT.connect(registrar).mintDeed(user.address, ipfsHash, location, areaSize)
      )
        .to.emit(deedNFT, "DeedMinted")
        .withArgs(1, user.address, ipfsHash, location, areaSize);

      expect(await deedNFT.ownerOf(1)).to.equal(user.address);
      expect(await deedNFT.tokenURI(1)).to.equal(ipfsHash);

      const deed = await deedNFT.landDeeds(1);
      expect(deed.tokenId).to.equal(1);
      expect(deed.owner).to.equal(user.address);
      expect(deed.ipfsHash).to.equal(ipfsHash);
      expect(deed.location).to.equal(location);
      expect(deed.areaSize).to.equal(areaSize);
      expect(deed.verified).to.be.false;
    });

    it("Should prevent duplicate IPFS hash", async function () {
      const ipfsHash = "QmTestHash123";
      const location = "Nairobi, Kenya";
      const areaSize = 1000;

      await deedNFT.connect(registrar).mintDeed(user.address, ipfsHash, location, areaSize);

      await expect(
        deedNFT.connect(registrar).mintDeed(user.address, ipfsHash, "Different Location", 2000)
      ).to.be.revertedWith("Deed already exists with this IPFS hash");
    });

    it("Should prevent non-registrar from minting", async function () {
      const ipfsHash = "QmTestHash123";
      const location = "Nairobi, Kenya";
      const areaSize = 1000;

      await expect(
        deedNFT.connect(user).mintDeed(user.address, ipfsHash, location, areaSize)
      ).to.be.reverted;
    });
  });

  describe("Verification", function () {
    beforeEach(async function () {
      const ipfsHash = "QmTestHash123";
      const location = "Nairobi, Kenya";
      const areaSize = 1000;

      await deedNFT.connect(registrar).mintDeed(user.address, ipfsHash, location, areaSize);
    });

    it("Should verify a deed", async function () {
      await expect(deedNFT.connect(verifier).verifyDeed(1))
        .to.emit(deedNFT, "DeedVerified")
        .withArgs(1, verifier.address, await ethers.provider.getBlock("latest").then(b => b.timestamp));

      const deed = await deedNFT.landDeeds(1);
      expect(deed.verified).to.be.true;
      expect(deed.verifiedBy).to.equal(verifier.address);
    });

    it("Should prevent non-verifier from verifying", async function () {
      await expect(
        deedNFT.connect(user).verifyDeed(1)
      ).to.be.reverted;
    });

    it("Should prevent verifying non-existent deed", async function () {
      await expect(
        deedNFT.connect(verifier).verifyDeed(999)
      ).to.be.revertedWith("Deed does not exist");
    });
  });

  describe("Transfers", function () {
    let anotherUser;

    beforeEach(async function () {
      [anotherUser] = await ethers.getSigners().then(signers => signers.slice(3, 4));

      const ipfsHash = "QmTestHash123";
      const location = "Nairobi, Kenya";
      const areaSize = 1000;

      await deedNFT.connect(registrar).mintDeed(user.address, ipfsHash, location, areaSize);
    });

    it("Should prevent transfer of unverified deed", async function () {
      await expect(
        deedNFT.connect(user).transferFrom(user.address, anotherUser.address, 1)
      ).to.be.revertedWith("Cannot transfer unverified deed");
    });

    it("Should allow transfer of verified deed", async function () {
      // Verify the deed first
      await deedNFT.connect(verifier).verifyDeed(1);

      await expect(
        deedNFT.connect(user).transferFrom(user.address, anotherUser.address, 1)
      )
        .to.emit(deedNFT, "DeedTransferred")
        .withArgs(1, user.address, anotherUser.address, await ethers.provider.getBlock("latest").then(b => b.timestamp));

      expect(await deedNFT.ownerOf(1)).to.equal(anotherUser.address);
    });
  });
});