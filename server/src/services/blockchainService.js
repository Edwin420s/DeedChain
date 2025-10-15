const { ethers } = require('ethers');
const { Web3Storage } = require('web3.storage');
const logger = require('../utils/logger');
const { BLOCKCHAIN } = require('../utils/constants');

class BlockchainService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
    
    if (process.env.PRIVATE_KEY) {
      this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    }
    
    // Contract ABIs
    this.deedNFTAbi = [
      "function mintDeed(address to, string memory ipfsHash, string memory location, uint256 areaSize) external returns (uint256)",
      "function ownerOf(uint256 tokenId) external view returns (address)",
      "function transferFrom(address from, address to, uint256 tokenId) external",
      "function tokenURI(uint256 tokenId) external view returns (string memory)",
      "function verifyDeed(uint256 tokenId) external",
      "function landDeeds(uint256) external view returns (uint256 tokenId, address owner, string memory ipfsHash, string memory location, uint256 areaSize, bool verified, uint256 verifiedAt, address verifiedBy)",
      "function totalDeeds() external view returns (uint256)"
    ];
    
    this.landRegistryAbi = [
      "function registerProperty(string memory ipfsHash, string memory location, uint256 areaSize, string memory coordinates) external returns (uint256)",
      "function verifyProperty(uint256 tokenId) external",
      "function transferOwnership(uint256 tokenId, address to) external",
      "function getProperty(uint256 tokenId) external view returns (tuple(uint256 tokenId, address owner, string memory ipfsHash, string memory location, uint256 areaSize, bool verified, uint256 registeredAt, uint256 verifiedAt))",
      "function isPropertyVerified(uint256 tokenId) external view returns (bool)",
      "function totalProperties() external view returns (uint256)"
    ];

    // Initialize contracts if addresses are provided
    if (process.env.DEED_NFT_ADDRESS) {
      this.deedNFTContract = new ethers.Contract(
        process.env.DEED_NFT_ADDRESS,
        this.deedNFTAbi,
        this.wallet || this.provider
      );
    }

    if (process.env.LAND_REGISTRY_ADDRESS) {
      this.landRegistryContract = new ethers.Contract(
        process.env.LAND_REGISTRY_ADDRESS,
        this.landRegistryAbi,
        this.wallet || this.provider
      );
    }

    // IPFS client
    if (process.env.WEB3_STORAGE_TOKEN) {
      this.ipfsClient = new Web3Storage({ token: process.env.WEB3_STORAGE_TOKEN });
    }
  }

  async mintDeedNFT(ownerAddress, ipfsHash, location, areaSize) {
    try {
      if (!this.deedNFTContract || !this.wallet) {
        throw new Error('Blockchain configuration incomplete');
      }

      logger.info(`Minting NFT for owner: ${ownerAddress}, IPFS: ${ipfsHash}`);
      
      const tx = await this.deedNFTContract.mintDeed(
        ownerAddress,
        ipfsHash,
        location,
        areaSize,
        { gasLimit: BLOCKCHAIN.GAS_LIMIT }
      );
      
      const receipt = await tx.wait(BLOCKCHAIN.CONFIRMATIONS_REQUIRED);
      
      // Extract token ID from event logs
      const event = receipt.logs.find(log => 
        log.topics[0] === ethers.id('DeedMinted(uint256,address,string,string,uint256)')
      );
      
      let tokenId;
      if (event) {
        tokenId = parseInt(event.topics[1], 16);
      } else {
        // Fallback: get the latest token ID
        tokenId = await this.deedNFTContract.totalDeeds();
      }
      
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
      if (!this.landRegistryContract || !this.wallet) {
        throw new Error('Blockchain configuration incomplete');
      }

      const tx = await this.landRegistryContract.verifyProperty(tokenId, {
        gasLimit: BLOCKCHAIN.GAS_LIMIT
      });
      
      const receipt = await tx.wait(BLOCKCHAIN.CONFIRMATIONS_REQUIRED);
      
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
      if (!this.deedNFTContract || !this.wallet) {
        throw new Error('Blockchain configuration incomplete');
      }

      const tx = await this.deedNFTContract.transferFrom(fromAddress, toAddress, tokenId, {
        gasLimit: BLOCKCHAIN.GAS_LIMIT
      });
      
      const receipt = await tx.wait(BLOCKCHAIN.CONFIRMATIONS_REQUIRED);
      
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

  async registerProperty(ipfsHash, location, areaSize, coordinates) {
    try {
      if (!this.landRegistryContract || !this.wallet) {
        throw new Error('Blockchain configuration incomplete');
      }

      const tx = await this.landRegistryContract.registerProperty(
        ipfsHash,
        location,
        areaSize,
        coordinates,
        { gasLimit: BLOCKCHAIN.GAS_LIMIT }
      );
      
      const receipt = await tx.wait(BLOCKCHAIN.CONFIRMATIONS_REQUIRED);
      
      logger.info(`Property registered on-chain: ${ipfsHash}`);
      
      return {
        success: true,
        txHash: receipt.hash
      };
    } catch (error) {
      logger.error('Property registration failed:', error);
      throw new Error(`Failed to register property: ${error.message}`);
    }
  }

  async getProperty(tokenId) {
    try {
      if (!this.landRegistryContract) {
        throw new Error('Blockchain configuration incomplete');
      }

      const property = await this.landRegistryContract.getProperty(tokenId);
      return {
        tokenId: property.tokenId.toString(),
        owner: property.owner,
        ipfsHash: property.ipfsHash,
        location: property.location,
        areaSize: property.areaSize.toString(),
        verified: property.verified,
        registeredAt: property.registeredAt.toString(),
        verifiedAt: property.verifiedAt.toString()
      };
    } catch (error) {
      logger.error('Failed to fetch property from blockchain:', error);
      throw new Error(`Failed to fetch property: ${error.message}`);
    }
  }

  async uploadToIPFS(metadata) {
    try {
      if (!this.ipfsClient) {
        throw new Error('IPFS client not configured');
      }

      const blob = new Blob([JSON.stringify(metadata, null, 2)], {
        type: 'application/json'
      });

      const files = [new File([blob], `property-${Date.now()}.json`)];
      
      const cid = await this.ipfsClient.put(files, {
        name: `DeedChain-Property-${Date.now()}`,
        maxRetries: 3
      });

      logger.info(`Metadata uploaded to IPFS with CID: ${cid}`);
      
      return {
        success: true,
        cid,
        url: `https://${cid}.ipfs.dweb.link`
      };
    } catch (error) {
      logger.error('IPFS upload failed:', error);
      throw new Error('Failed to upload metadata to IPFS');
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

  async getBlockNumber() {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      logger.error('Failed to get block number:', error);
      throw error;
    }
  }

  async getGasPrice() {
    try {
      const feeData = await this.provider.getFeeData();
      return {
        gasPrice: feeData.gasPrice?.toString(),
        maxFeePerGas: feeData.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString()
      };
    } catch (error) {
      logger.error('Failed to get gas price:', error);
      throw error;
    }
  }
}

module.exports = new BlockchainService();