const Queue = require('bull');
const logger = require('../utils/logger');
const blockchainService = require('./blockchainService');
const emailService = require('./emailService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class QueueService {
  constructor() {
    this.verificationQueue = new Queue('property verification', process.env.REDIS_URL);
    this.transferQueue = new Queue('property transfer', process.env.REDIS_URL);
    this.ipfsQueue = new Queue('ipfs upload', process.env.REDIS_URL);

    this.setupProcessors();
  }

  setupProcessors() {
    // Process property verification
    this.verificationQueue.process('verify-property', async (job) => {
      const { propertyId, verifierId, approved } = job.data;
      
      try {
        const property = await prisma.property.findUnique({
          where: { id: propertyId },
          include: { owner: true }
        });

        if (!property) {
          throw new Error(`Property ${propertyId} not found`);
        }

        // If approved, mint NFT on blockchain
        if (approved && !property.tokenId) {
          const mintResult = await blockchainService.mintDeedNFT(
            property.owner.walletAddress,
            property.ipfsHash,
            property.location,
            property.size
          );

          // Update property with token ID
          await prisma.property.update({
            where: { id: propertyId },
            data: { tokenId: mintResult.tokenId }
          });

          // Verify property on registry
          await blockchainService.verifyProperty(mintResult.tokenId);

          logger.info(`Property ${propertyId} verified and NFT minted with token ID: ${mintResult.tokenId}`);
        }

        // Send notification email
        if (property.owner.email) {
          await emailService.sendVerificationNotification(
            property.owner.email,
            property.title,
            approved
          );
        }

        return { success: true, propertyId, tokenId: property.tokenId };
      } catch (error) {
        logger.error(`Verification job failed for property ${propertyId}:`, error);
        throw error;
      }
    });

    // Process property transfers
    this.transferQueue.process('execute-transfer', async (job) => {
      const { transferId, signature } = job.data;
      
      try {
        const transfer = await prisma.transfer.findUnique({
          where: { id: transferId },
          include: {
            property: {
              include: {
                owner: true
              }
            },
            fromUser: true,
            toUser: true
          }
        });

        if (!transfer) {
          throw new Error(`Transfer ${transferId} not found`);
        }

        if (!transfer.property.tokenId) {
          throw new Error(`Property ${transfer.propertyId} has no token ID`);
        }

        // Execute transfer on blockchain
        const transferResult = await blockchainService.transferOwnership(
          transfer.property.tokenId,
          transfer.fromUser.walletAddress,
          transfer.toUser.walletAddress
        );

        // Update transfer record
        await prisma.transfer.update({
          where: { id: transferId },
          data: {
            status: 'COMPLETED',
            txHash: transferResult.txHash,
            completedAt: new Date()
          }
        });

        // Update property ownership
        await prisma.property.update({
          where: { id: transfer.propertyId },
          data: {
            ownerId: transfer.toUserId,
            status: 'VERIFIED'
          }
        });

        // Send notification emails
        if (transfer.fromUser.email) {
          await emailService.sendTransferNotification(
            transfer.fromUser.email,
            transfer.property.title,
            false
          );
        }

        if (transfer.toUser.email) {
          await emailService.sendTransferNotification(
            transfer.toUser.email,
            transfer.property.title,
            true
          );
        }

        return { success: true, transferId, txHash: transferResult.txHash };
      } catch (error) {
        logger.error(`Transfer job failed for transfer ${transferId}:`, error);
        
        // Mark transfer as failed
        await prisma.transfer.update({
          where: { id: transferId },
          data: { status: 'REJECTED' }
        });

        throw error;
      }
    });

    // Process IPFS uploads
    this.ipfsQueue.process('upload-to-ipfs', async (job) => {
      const { propertyId, metadata } = job.data;
      
      try {
        const ipfsResult = await blockchainService.uploadToIPFS(metadata);
        
        // Update property with IPFS hash
        await prisma.property.update({
          where: { id: propertyId },
          data: { ipfsHash: ipfsResult.cid }
        });

        return { success: true, propertyId, ipfsHash: ipfsResult.cid };
      } catch (error) {
        logger.error(`IPFS upload failed for property ${propertyId}:`, error);
        throw error;
      }
    });
  }

  async addVerificationJob(propertyId, verifierId, approved) {
    return await this.verificationQueue.add('verify-property', {
      propertyId,
      verifierId,
      approved
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    });
  }

  async addTransferJob(transferId, signature = null) {
    return await this.transferQueue.add('execute-transfer', {
      transferId,
      signature
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    });
  }

  async addIPFSUploadJob(propertyId, metadata) {
    return await this.ipfsQueue.add('upload-to-ipfs', {
      propertyId,
      metadata
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 3000
      }
    });
  }

  async getQueueStats() {
    const verificationStats = await this.verificationQueue.getJobCounts();
    const transferStats = await this.transferQueue.getJobCounts();
    const ipfsStats = await this.ipfsQueue.getJobCounts();

    return {
      verification: verificationStats,
      transfer: transferStats,
      ipfs: ipfsStats
    };
  }
}

module.exports = new QueueService();