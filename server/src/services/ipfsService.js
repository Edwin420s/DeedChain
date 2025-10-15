const { Web3Storage } = require('web3.storage');
const logger = require('../utils/logger');

class IPFSService {
  constructor() {
    this.client = new Web3Storage({ 
      token: process.env.WEB3_STORAGE_TOKEN 
    });
  }

  async uploadPropertyMetadata(propertyData) {
    try {
      const metadata = {
        title: propertyData.title,
        description: propertyData.description,
        location: propertyData.location,
        coordinates: propertyData.coordinates,
        size: propertyData.size,
        owner: propertyData.ownerWalletAddress,
        timestamp: new Date().toISOString(),
        documentType: 'land_deed'
      };

      const blob = new Blob([JSON.stringify(metadata, null, 2)], {
        type: 'application/json'
      });

      const files = [new File([blob], `property-${Date.now()}.json`)];
      
      const cid = await this.client.put(files, {
        name: `DeedChain-Property-${Date.now()}`,
        maxRetries: 3
      });

      logger.info(`Property metadata uploaded to IPFS with CID: ${cid}`);
      
      return {
        success: true,
        cid,
        url: `https://${cid}.ipfs.dweb.link`
      };
    } catch (error) {
      logger.error('IPFS upload failed:', error);
      throw new Error('Failed to upload property metadata to IPFS');
    }
  }

  async uploadDocument(fileBuffer, fileName) {
    try {
      const file = new File([fileBuffer], fileName);
      const cid = await this.client.put([file], {
        name: `DeedChain-Document-${Date.now()}`
      });

      logger.info(`Document uploaded to IPFS with CID: ${cid}`);
      
      return {
        success: true,
        cid,
        url: `https://${cid}.ipfs.dweb.link`
      };
    } catch (error) {
      logger.error('Document upload failed:', error);
      throw new Error('Failed to upload document to IPFS');
    }
  }

  async retrieveMetadata(cid) {
    try {
      const res = await this.client.get(cid);
      if (!res.ok) {
        throw new Error(`Failed to get ${cid}`);
      }

      const files = await res.files();
      for (const file of files) {
        if (file.name.endsWith('.json')) {
          const content = await file.text();
          return JSON.parse(content);
        }
      }
      
      throw new Error('No metadata file found');
    } catch (error) {
      logger.error('IPFS retrieval failed:', error);
      throw new Error('Failed to retrieve metadata from IPFS');
    }
  }
}

module.exports = new IPFSService();