const { ethers } = require('ethers');
const logger = require('../utils/logger');

class BlockchainService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    
    // Contract ABIs would be imported from compiled contracts
    this.deedNFTAbi = [
      "function mintDeed(address to, string memory tokenURI) external returns (uint256)",
      "function ownerOf(uint256 tokenId) external view returns (address)",
      "function transferFrom(address from, address to, uint256 tokenId) external",
      "function tokenURI(uint256 tokenId) external view returns (string memory)"
    ];
    
    this.landRegistryAbi = [
      "function registerProperty(string memory ipfsHash, string memory location) external returns (uint256)",
      "function verifyProperty(uint256 tokenId) external",
      "function getProperty(uint256 tokenId) external view returns (tuple(uint256 id, address owner, string ipfsHash, bool verified))"
    ];

    this.deedNFTContract = new ethers.Contract(
      process.env.DEED_NFT_ADDRESS,
      this.deedNFTAbi,
      this.wallet
    );

    this.landRegistryContract = new ethers.Contract(
      process.env.LAND_REGISTRY_ADDRESS,
      this.landRegistryAbi,
      this.wallet
    );
  }

  async mintDeedNFT(ownerAddress, ipfsHash) {
    try {
      logger.info(`Minting NFT for owner: ${ownerAddress}, IPFS: ${ipfsHash}`);
      
      const tx = await this.deedNFTContract.mintDeed(ownerAddress, ipfsHash);
      const receipt = await tx.wait();
      
      // Extract token ID from event logs
      const event = receipt.logs.find(log => 
        log.address.toLowerCase() === process.env.DEED_NFT_ADDRESS.toLowerCase()
      );
      
      const tokenId = parseInt(event.data, 16);
      
      logger.info(`NFT minted successfully with token ID: ${tokenId}`);
      
      return {
        success: true,
        tokenId,
        txHash: receipt.hash
      };
    } catch (error) {
      logger.error('NFT minting failed:', error);
      throw new Error(`Failed to mint NFT: ${error.message}`);
    }
  }

  async verifyProperty(tokenId) {
    try {
      const tx = await this.landRegistryContract.verifyProperty(tokenId);
      const receipt = await tx.wait();
      
      logger.info(`Property ${tokenId} verified on-chain`);
      
      return {
        success: true,
        txHash: receipt.hash
      };
    } catch (error) {
      logger.error('Property verification failed:', error);
      throw new Error(`Failed to verify property: ${error.message}`);
    }
  }

  async transferOwnership(tokenId, fromAddress, toAddress) {
    try {
      const tx = await this.deedNFTContract.transferFrom(fromAddress, toAddress, tokenId);
      const receipt = await tx.wait();
      
      logger.info(`Ownership transferred for token ${tokenId} from ${fromAddress} to ${toAddress}`);
      
      return {
        success: true,
        txHash: receipt.hash
      };
    } catch (error) {
      logger.error('Ownership transfer failed:', error);
      throw new Error(`Failed to transfer ownership: ${error.message}`);
    }
  }

  async getProperty(tokenId) {
    try {
      const property = await this.landRegistryContract.getProperty(tokenId);
      return {
        id: property.id.toString(),
        owner: property.owner,
        ipfsHash: property.ipfsHash,
        verified: property.verified
      };
    } catch (error) {
      logger.error('Failed to fetch property from blockchain:', error);
      throw new Error(`Failed to fetch property: ${error.message}`);
    }
  }

  async validateWalletSignature(message, signature, address) {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      logger.error('Signature validation failed:', error);
      return false;
    }
  }
}

module.exports = new BlockchainService();