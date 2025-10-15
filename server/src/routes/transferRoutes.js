const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/authMiddleware');
const blockchainService = require('../services/blockchainService');
const logger = require('../utils/logger');

const router = express.Router();
const prisma = new PrismaClient();

// Initiate property transfer
router.post('/initiate', authenticateToken, async (req, res) => {
  try {
    const { propertyId, toWalletAddress } = req.body;

    if (!propertyId || !toWalletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Property ID and recipient wallet address are required'
      });
    }

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

    // Find recipient user or create if doesn't exist
    let toUser = await prisma.user.findUnique({
      where: { walletAddress: toWalletAddress }
    });

    if (!toUser) {
      toUser = await prisma.user.create({
        data: {
          walletAddress: toWalletAddress,
          role: 'CITIZEN'
        }
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
});

// Complete transfer (execute on blockchain)
router.post('/:transferId/complete', authenticateToken, async (req, res) => {
  try {
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

    // Execute transfer on blockchain
    const transferResult = await blockchainService.transferOwnership(
      transfer.property.tokenId,
      transfer.fromUser.walletAddress,
      transfer.toUser.walletAddress
    );

    // Update transfer record
    const updatedTransfer = await prisma.transfer.update({
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

    logger.info(`Transfer ${transferId} completed successfully on blockchain`);

    res.json({
      success: true,
      message: 'Transfer completed successfully',
      data: { 
        transfer: updatedTransfer,
        txHash: transferResult.txHash
      }
    });

  } catch (error) {
    logger.error('Transfer completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete transfer'
    });
  }
});

// Get user's transfer history
router.get('/my-transfers', authenticateToken, async (req, res) => {
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
});

// Cancel transfer
router.post('/:transferId/cancel', authenticateToken, async (req, res) => {
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
});

module.exports = router;