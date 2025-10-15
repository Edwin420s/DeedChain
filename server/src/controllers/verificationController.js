const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');
const queueService = require('../services/queueService');
const emailService = require('./emailService');
const { verificationValidation } = require('../utils/validation');

const prisma = new PrismaClient();

const verificationController = {
  // Get pending verifications
  getPendingVerifications: async (req, res) => {
    try {
      const { error } = verificationValidation.list.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

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
            },
            verifications: {
              take: 1,
              orderBy: { createdAt: 'desc' }
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
  },

  // Verify property
  verifyProperty: async (req, res) => {
    try {
      const { error } = verificationValidation.verify.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const { propertyId } = req.params;
      const { approved, comments } = req.body;

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

      // Add to queue for blockchain operations
      if (approved) {
        await queueService.addVerificationJob(propertyId, req.user.id, approved);
      } else {
        // Send rejection notification
        if (property.owner.email) {
          await emailService.sendVerificationNotification(
            property.owner.email,
            property.title,
            false
          );
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
  },

  // Get verification history for a property
  getVerificationHistory: async (req, res) => {
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
  },

  // Get verifier statistics
  getVerifierStats: async (req, res) => {
    try {
      const [totalVerifications, approvedCount, rejectedCount, pendingCount] = await Promise.all([
        prisma.verification.count({ where: { verifierId: req.user.id } }),
        prisma.verification.count({ where: { verifierId: req.user.id, approved: true } }),
        prisma.verification.count({ where: { verifierId: req.user.id, approved: false } }),
        prisma.property.count({ where: { status: 'PENDING' } })
      ]);

      const stats = {
        totalVerifications,
        approvedCount,
        rejectedCount,
        pendingCount,
        approvalRate: totalVerifications > 0 ? (approvedCount / totalVerifications) * 100 : 0
      };

      res.json({
        success: true,
        data: { stats }
      });

    } catch (error) {
      logger.error('Get verifier stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch verifier statistics'
      });
    }
  },

  // Get all verifications (admin only)
  getAllVerifications: async (req, res) => {
    try {
      const { page = 1, limit = 10, approved, verifierId } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = {};
      
      if (approved !== undefined) {
        where.approved = approved === 'true';
      }

      if (verifierId) {
        where.verifierId = verifierId;
      }

      const [verifications, total] = await Promise.all([
        prisma.verification.findMany({
          where,
          include: {
            property: {
              select: {
                title: true,
                location: true,
                status: true
              }
            },
            verifier: {
              select: {
                name: true,
                walletAddress: true,
                role: true
              }
            }
          },
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.verification.count({ where })
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
      logger.error('Get all verifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch verifications'
      });
    }
  }
};

module.exports = verificationController;