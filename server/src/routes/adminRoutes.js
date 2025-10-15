const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const queueService = require('../services/queueService');
const logger = require('../utils/logger');

const router = express.Router();
const prisma = new PrismaClient();

// Admin dashboard statistics
router.get('/dashboard', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const [
      totalUsers,
      totalProperties,
      pendingVerifications,
      completedTransfers,
      recentActivities
    ] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.property.count({ where: { status: 'PENDING' } }),
      prisma.transfer.count({ where: { status: 'COMPLETED' } }),
      prisma.property.findMany({
        include: {
          owner: {
            select: {
              walletAddress: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    const queueStats = await queueService.getQueueStats();

    const stats = {
      users: totalUsers,
      properties: totalProperties,
      pendingVerifications,
      completedTransfers,
      queueStats
    };

    res.json({
      success: true,
      data: {
        stats,
        recentActivities
      }
    });

  } catch (error) {
    logger.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin dashboard data'
    });
  }
});

// System health check
router.get('/health', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Redis connection (via queue stats)
    const queueStats = await queueService.getQueueStats();

    const health = {
      database: 'healthy',
      redis: 'healthy',
      server: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };

    res.json({
      success: true,
      data: { health, queueStats }
    });

  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Get system logs (simplified version)
router.get('/logs', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { type = 'all', limit = 100 } = req.query;

    // In production, you would query your logging system
    // This is a simplified version that returns recent activities
    const logs = await prisma.property.findMany({
      where: type === 'registrations' ? {} : undefined,
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
                walletAddress: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: { logs }
    });

  } catch (error) {
    logger.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system logs'
    });
  }
});

module.exports = router;