const express = require('express');
const userRoutes = require('./userRoutes');
const propertyRoutes = require('./propertyRoutes');
const verificationRoutes = require('./verificationRoutes');
const transferRoutes = require('./transferRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

// API routes
router.use('/users', userRoutes);
router.use('/properties', propertyRoutes);
router.use('/verifications', verificationRoutes);
router.use('/transfers', transferRoutes);
router.use('/admin', adminRoutes);

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DeedChain API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      users: '/api/users',
      properties: '/api/properties',
      verifications: '/api/verifications',
      transfers: '/api/transfers',
      admin: '/api/admin'
    }
  });
});

module.exports = router;