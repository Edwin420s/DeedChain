const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const ipfsService = require('../services/ipfsService');
const blockchainService = require('../services/blockchainService');
const logger = require('../utils/logger');

const router = express.Router();
const prisma = new PrismaClient();

// Register new property
router.post('/register', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      coordinates,
      size
    } = req.body;

    // Validate required fields
    if (!title || !location || !coordinates || !size) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, location, coordinates, size'
      });
    }

    // Upload property metadata to IPFS
    const ipfsResult = await ipfsService.uploadPropertyMetadata({
      title,
      description,
      location,
      coordinates,
      size,
      ownerWalletAddress: req.user.walletAddress
    });

    // Create property record in database
    const property = await prisma.property.create({
      data: {
        title,
        description,
        location,
        coordinates,
        size: parseFloat(size),
        ipfsHash: ipfsResult.cid,
        ownerId: req.user.id,
        status: 'PENDING'
      }
    });

    logger.info(`Property registered: ${property.id} by user ${req.user.walletAddress}`);

    res.status(201).json({
      success: true,
      message: 'Property registered successfully',
      data: {
        property: {
          id: property.id,
          title: property.title,
          location: property.location,
          ipfsHash: property.ipfsHash,
          status: property.status,
          createdAt: property.createdAt
        }
      }
    });

  } catch (error) {
    logger.error('Property registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register property'
    });
  }
});

// Get all properties (with filtering and pagination)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          owner: {
            select: {
              walletAddress: true,
              name: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.property.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        properties,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties'
    });
  }
});

// Get property by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            walletAddress: true,
            name: true,
            email: true
          }
        },
        verifications: {
          include: {
            verifier: {
              select: {
                name: true,
                walletAddress: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        transfers: {
          include: {
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
        }
      }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: { property }
    });

  } catch (error) {
    logger.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property'
    });
  }
});

// Get user's properties
router.get('/user/my-properties', authenticateToken, async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: { ownerId: req.user.id },
      include: {
        verifications: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { properties }
    });

  } catch (error) {
    logger.error('Get user properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user properties'
    });
  }
});

// Update property (only owner)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const property = await prisma.property.findUnique({
      where: { id }
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
        message: 'Not authorized to update this property'
      });
    }

    if (property.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update property after verification process has started'
      });
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description })
      }
    });

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: { property: updatedProperty }
    });

  } catch (error) {
    logger.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update property'
    });
  }
});

module.exports = router;