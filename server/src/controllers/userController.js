const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const blockchainService = require('../services/blockchainService');
const { userValidation } = require('../utils/validation');

const prisma = new PrismaClient();

const userController = {
  // Authenticate user with wallet
  authWithWallet: async (req, res) => {
    try {
      const { error } = userValidation.auth.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const { walletAddress, signature, message } = req.body;

      // Validate signature if provided
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
        where: { walletAddress: walletAddress.toLowerCase() }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            walletAddress: walletAddress.toLowerCase(),
            role: 'CITIZEN'
          }
        });
        logger.info(`New user created: ${walletAddress}`);
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          walletAddress: user.walletAddress,
          userId: user.id,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
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
            role: user.role,
            createdAt: user.createdAt
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
  },

  // Get user profile
  getProfile: async (req, res) => {
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
          updatedAt: true,
          _count: {
            select: {
              ownedProperties: true,
              verifications: true,
              sentTransfers: true,
              receivedTransfers: true
            }
          }
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
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const { error } = userValidation.updateProfile.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const { email, name } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(email && { email: email.toLowerCase() }),
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

      logger.info(`User profile updated: ${req.user.walletAddress}`);

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
  },

  // Get user statistics
  getUserStats: async (req, res) => {
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

      const stats = {
        totalProperties: propertyCount,
        verifiedProperties: verifiedCount,
        pendingProperties: pendingCount,
        totalTransfers: transferCount
      };

      res.json({
        success: true,
        data: { stats }
      });

    } catch (error) {
      logger.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user statistics'
      });
    }
  },

  // Get all users (admin only)
  getAllUsers: async (req, res) => {
    try {
      const { page = 1, limit = 10, role, search } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = {};
      
      if (role) {
        where.role = role;
      }

      if (search) {
        where.OR = [
          { walletAddress: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
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
  },

  // Update user role (admin only)
  updateUserRole: async (req, res) => {
    try {
      const { error } = userValidation.updateRole.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const { userId } = req.params;
      const { role } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
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
          role: true,
          createdAt: true
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
  }
};

module.exports = userController;