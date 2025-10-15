const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');
const queueService = require('../services/queueService');
const blockchainService = require('../services/blockchainService');
const { transferValidation } = require('../utils/validation');

const prisma = new PrismaClient();

const transferController = {
  // Initiate property transfer
  initiateTransfer: async (req, res) => {
    try {
      const { error } = transferValidation.initiate.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const { propertyId, toWalletAddress } = req.body;

      // Find property
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: { owner: true }
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      if (property.ownerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to transfer this property'
        });
      }

      if (property.status !== 'VERIFIED') {
        return res.status(400).json({
          success: false,
          message: 'Only verified properties can be transferred'
        });
      }

      if (!property.tokenId) {
        return res.status(400).json({
          success: false,
          message: 'Property does not have a token ID'
        });
      }

      // Find recipient user or create if doesn't exist
      let toUser = await prisma.user.findUnique({
        where: { walletAddress: toWalletAddress.toLowerCase() }
      });

      if (!toUser) {
        toUser = await prisma.user.create({
          data: {
            walletAddress: toWalletAddress.toLowerCase(),
            role: 'CITIZEN'
          }
        });
        logger.info(`New user created for transfer: ${toWalletAddress}`);
      }

      // Check if user is transferring to themselves
      if (toUser.id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot transfer property to yourself'
        });
      }

      // Create transfer record
      const transfer = await prisma.transfer.create({
        data: {
          propertyId,
          fromUserId: req.user.id,
          toUserId: toUser.id,
          status: 'PENDING'
        },
        include: {
          property: {
            select: {
              title: true,
              location: true,
              tokenId: true
            }
          },
          toUser: {
            select: {
              walletAddress: true,
              name: true
            }
          },
          fromUser: {
            select: {
              walletAddress: true,
              name: true
            }
          }
        }
      });

      // Update property status
      await prisma.property.update({
        where: { id: propertyId },
        data: { status: 'TRANSFERRING' }
      });

      logger.info(`Transfer initiated for property ${propertyId} from ${req.user.walletAddress} to ${toWalletAddress}`);

      res.status(201).json({
        success: true,
        message: 'Transfer initiated successfully',
        data: { transfer }
      });

    } catch (error) {
      logger.error('Transfer initiation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initiate transfer'
      });
    }
  },

  // Complete transfer (execute on blockchain)
  completeTransfer: async (req, res) => {
    try {
      const { error } = transferValidation.complete.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const { transferId } = req.params;
      const { signature } = req.body;

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
        return res.status(404).json({
          success: false,
          message: 'Transfer not found'
        });
      }

      if (transfer.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: 'Transfer is not pending'
        });
      }

      // Verify that the current user is the recipient
      if (transfer.toUserId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to complete this transfer'
        });
      }

      // Validate signature (optional - for additional security)
      if (signature) {
        const message = `Confirm property transfer: ${transfer.propertyId}`;
        const isValidSignature = await blockchainService.validateWalletSignature(
          message,
          signature,
          req.user.walletAddress
        );

        if (!isValidSignature) {
          return res.status(400).json({
            success: false,
            message: 'Invalid signature'
          });
        }
      }

      // Add to queue for blockchain execution
      const job = await queueService.addTransferJob(transferId, signature);

      logger.info(`Transfer ${transferId} queued for blockchain execution`);

      res.json({
        success: true,
        message: 'Transfer queued for execution',
        data: { 
          transferId,
          jobId: job.id
        }
      });

    } catch (error) {
      logger.error('Transfer completion error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete transfer'
      });
    }
  },

  // Get user's transfer history
  getUserTransfers: async (req, res) => {
    try {
      const transfers = await prisma.transfer.findMany({
        where: {
          OR: [
            { fromUserId: req.user.id },
            { toUserId: req.user.id }
          ]
        },
        include: {
          property: {
            select: {
              title: true,
              location: true,
              tokenId: true
            }
          },
          fromUser: {
            select: {
              walletAddress: true,
              name: true
            }
          },
          toUser: {
            select: {
              walletAddress: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: { transfers }
      });

    } catch (error) {
      logger.error('Get transfer history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transfer history'
      });
    }
  },

  // Cancel transfer
  cancelTransfer: async (req, res) => {
    try {
      const { transferId } = req.params;

      const transfer = await prisma.transfer.findUnique({
        where: { id: transferId },
        include: {
          property: true
        }
      });

      if (!transfer) {
        return res.status(404).json({
          success: false,
          message: 'Transfer not found'
        });
      }

      if (transfer.fromUserId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to cancel this transfer'
        });
      }

      if (transfer.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: 'Only pending transfers can be cancelled'
        });
      }

      // Update transfer status
      await prisma.transfer.update({
        where: { id: transferId },
        data: { status: 'REJECTED' }
      });

      // Reset property status
      await prisma.property.update({
        where: { id: transfer.propertyId },
        data: { status: 'VERIFIED' }
      });

      logger.info(`Transfer ${transferId} cancelled by owner`);

      res.json({
        success: true,
        message: 'Transfer cancelled successfully'
      });

    } catch (error) {
      logger.error('Transfer cancellation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel transfer'
      });
    }
  },

  // Get transfer by ID
  getTransferById: async (req, res) => {
    try {
      const { transferId } = req.params;

      const transfer = await prisma.transfer.findUnique({
        where: { id: transferId },
        include: {
          property: {
            include: {
              owner: {
                select: {
                  walletAddress: true,
                  name: true
                }
              }
            }
          },
          fromUser: {
            select: {
              walletAddress: true,
              name: true,
              email: true
            }
          },
          toUser: {
            select: {
              walletAddress: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!transfer) {
        return res.status(404).json({
          success: false,
          message: 'Transfer not found'
        });
      }

      // Check if user is involved in the transfer
      if (transfer.fromUserId !== req.user.id && transfer.toUserId !== req.user.id && req.user.role === 'CITIZEN') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this transfer'
        });
      }

      res.json({
        success: true,
        data: { transfer }
      });

    } catch (error) {
      logger.error('Get transfer error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transfer'
      });
    }
  }
};

module.exports = transferController;