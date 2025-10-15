const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const blockchainService = require('../services/blockchainService');
const logger = require('../utils/logger');

const router = express.Router();
const prisma = new PrismaClient();

// Get pending verifications
router.get('/pending', authenticateToken, requireRole(['VERIFIER', 'ADMIN']), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [verifications, total] = await Promise.all([
      prisma.property.findMany({
        where: { status: 'PENDING' },
        include: {
          owner: {
            select: {
              walletAddress: true,
              name: true,
              email: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'asc' }
      }),
      prisma.property.count({ where: { status: 'PENDING' } })
    ]);

    res.json({
      success: true,
      data: {
        verifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error('Get pending verifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending verifications'
    });
  }
});

// Verify property
router.post('/:propertyId/verify', authenticateToken, requireRole(['VERIFIER', 'ADMIN']), async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { approved, comments } = req.body;

    if (typeof approved !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Approved field is required and must be boolean'
      });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        owner: true
      }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (property.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Property is not pending verification'
      });
    }

    // Create verification record
    const verification = await prisma.verification.create({
      data: {
        propertyId,
        verifierId: req.user.id,
        approved,
        comments: comments || null
      }
    });

    // Update property status
    const newStatus = approved ? 'VERIFIED' : 'REJECTED';
    await prisma.property.update({
      where: { id: propertyId },
      data: { status: newStatus }
    });

    // If approved, mint NFT on blockchain
    if (approved) {
      try {
        const mintResult = await blockchainService.mintDeedNFT(
          property.owner.walletAddress,
          property.ipfsHash
        );

        // Update property with token ID
        await prisma.property.update({
          where: { id: propertyId },
          data: { tokenId: mintResult.tokenId }
        });

        // Verify property on registry contract
        await blockchainService.verifyProperty(mintResult.tokenId);

        logger.info(`Property ${propertyId} verified and NFT minted with token ID: ${mintResult.tokenId}`);
      } catch (blockchainError) {
        logger.error('Blockchain operation failed:', blockchainError);
        // Don't fail the entire request if blockchain ops fail
        // The verification record is still created
      }
    }

    logger.info(`Property ${propertyId} ${approved ? 'approved' : 'rejected'} by verifier ${req.user.walletAddress}`);

    res.json({
      success: true,
      message: `Property ${approved ? 'verified' : 'rejected'} successfully`,
      data: { verification }
    });

  } catch (error) {
    logger.error('Property verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify property'
    });
  }
});

// Get verification history for a property
router.get('/property/:propertyId', authenticateToken, async (req, res) => {
  try {
    const { propertyId } = req.params;

    const verifications = await prisma.verification.findMany({
      where: { propertyId },
      include: {
        verifier: {
          select: {
            name: true,
            walletAddress: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { verifications }
    });

  } catch (error) {
    logger.error('Get verification history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch verification history'
    });
  }
});

module.exports = router;