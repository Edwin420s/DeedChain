/**
 * User Routes
 * Base: /api/users
 * Auth: JWT required for profile, stats, admin operations. Wallet auth is public.
 * Endpoints:
 *  - POST /auth/wallet: Authenticate via wallet address (optionally with signature).
 *  - GET /profile: Get current user profile (JWT).
 *  - PUT /profile: Update current user profile (JWT).
 *  - GET /stats: Usage statistics for current user (JWT).
 *  - GET /: Admin list users with filters (ADMIN role).
 *  - PATCH /:userId/role: Update user role (ADMIN role).
 */
const express = require('express');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const blockchainService = require('../services/blockchainService');
const logger = require('../utils/logger');

const router = express.Router();
const prisma = new PrismaClient();

// User authentication with wallet
router.post('/auth/wallet', async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required'
      });
    }

    // For production: validate signature against message
    if (signature && message) {
      const isValidSignature = await blockchainService.validateWalletSignature(
        message,
        signature,
        walletAddress
      );

      if (!isValidSignature) {
        return res.status(401).json({
          success: false,
          message: 'Invalid signature'
        });
      }
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress,
          role: 'CITIZEN'
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        walletAddress: user.walletAddress,
        userId: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info(`User authenticated: ${walletAddress}`);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });

  } catch (error) {
    logger.error('User authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        walletAddress: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { email, name } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(email && { email }),
        ...(name && { name })
      },
      select: {
        id: true,
        walletAddress: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    logger.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [propertyCount, verifiedCount, pendingCount, transferCount] = await Promise.all([
      prisma.property.count({ where: { ownerId: req.user.id } }),
      prisma.property.count({ where: { ownerId: req.user.id, status: 'VERIFIED' } }),
      prisma.property.count({ where: { ownerId: req.user.id, status: 'PENDING' } }),
      prisma.transfer.count({
        where: {
          OR: [
            { fromUserId: req.user.id },
            { toUserId: req.user.id }
          ]
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalProperties: propertyCount,
          verifiedProperties: verifiedCount,
          pendingProperties: pendingCount,
          totalTransfers: transferCount
        }
      }
    });

  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
});

// Admin: Get all users
router.get('/', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          walletAddress: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              ownedProperties: true,
              verifications: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Admin: Update user role
router.patch('/:userId/role', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['CITIZEN', 'VERIFIER', 'ADMIN'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        walletAddress: true,
        email: true,
        name: true,
        role: true
      }
    });

    logger.info(`User role updated: ${updatedUser.walletAddress} -> ${role}`);

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    logger.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role'
    });
  }
});

module.exports = router;