const express = require('express');
const userRoutes = require('./userRoutes');
const propertyRoutes = require('./propertyRoutes');
const verificationRoutes = require('./verificationRoutes');
const transferRoutes = require('./transferRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/properties', propertyRoutes);
router.use('/verifications', verificationRoutes);
router.use('/transfers', transferRoutes);
router.use('/admin', adminRoutes);

module.exports = router;