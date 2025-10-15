const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');
const ipfsService = require('../services/ipfsService');
const queueService = require('../services/queueService');
const { propertyValidation } = require('../utils/validation');

const prisma = new PrismaClient();

const propertyController = {
  // Register new property
  registerProperty: async (req, res) => {
    try {
      const { error } = propertyValidation.register.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const {
        title,
        description,
        location,
        coordinates,
        size,
        documents
      } = req.body;

      // Upload property metadata to IPFS
      const ipfsResult = await ipfsService.uploadPropertyMetadata({
        title,
        description,
        location,
        coordinates,
        size,
        ownerWalletAddress: req.user.walletAddress,
        documents: documents || []
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
        },
        include: {
          owner: {
            select: {
              walletAddress: true,
              name: true
            }
          }
        }
      });

      logger.info(`Property registered: ${property.id} by user ${req.user.walletAddress}`);

      // Add to IPFS queue for additional processing
      await queueService.addIPFSUploadJob(property.id, {
        title,
        description,
        location,
        coordinates,
        size,
        owner: req.user.walletAddress,
        registeredAt: property.createdAt
      });

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
  },

  // Get all properties with filtering and pagination
  getProperties: async (req, res) => {
    try {
      const { error } = propertyValidation.list.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const { page = 1, limit = 10, status, search } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = {};
      
      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      // If user is not admin, only show their properties or public verified properties
      if (req.user.role === 'CITIZEN') {
        where.OR = [
          { ownerId: req.user.id },
          { status: 'VERIFIED' }
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
            },
            verifications: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              include: {
                verifier: {
                  select: {
                    name: true,
                    walletAddress: true
                  }
                }
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
  },

  // Get property by ID
  getPropertyById: async (req, res) => {
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
                  walletAddress: true,
                  role: true
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

      // Check if user has permission to view this property
      if (property.ownerId !== req.user.id && req.user.role === 'CITIZEN' && property.status !== 'VERIFIED') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this property'
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
  },

  // Get user's properties
  getUserProperties: async (req, res) => {
    try {
      const properties = await prisma.property.findMany({
        where: { ownerId: req.user.id },
        include: {
          verifications: {
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          transfers: {
            orderBy: { createdAt: 'desc' },
            take: 5
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
  },

  // Update property (only owner)
  updateProperty: async (req, res) => {
    try {
      const { error } = propertyValidation.update.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

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
        },
        include: {
          owner: {
            select: {
              walletAddress: true,
              name: true
            }
          }
        }
      });

      logger.info(`Property updated: ${id} by user ${req.user.walletAddress}`);

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
  },

  // Search properties by coordinates or location
  searchProperties: async (req, res) => {
    try {
      const { coordinates, location, radius = 10 } = req.query;

      if (!coordinates && !location) {
        return res.status(400).json({
          success: false,
          message: 'Either coordinates or location is required'
        });
      }

      let where = { status: 'VERIFIED' };

      if (coordinates) {
        // Simple coordinate-based search (in production, use PostGIS for proper spatial queries)
        where.coordinates = {
          contains: coordinates
        };
      }

      if (location) {
        where.location = {
          contains: location,
          mode: 'insensitive'
        };
      }

      const properties = await prisma.property.findMany({
        where,
        include: {
          owner: {
            select: {
              walletAddress: true,
              name: true
            }
          }
        },
        take: 50,
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: { properties }
      });

    } catch (error) {
      logger.error('Search properties error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search properties'
      });
    }
  }
};

module.exports = propertyController;