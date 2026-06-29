const express = require('express');
const router = express.Router();
const {
  getPublicStats,
  getCategoryStats,
  getTopSellers,
  getAdminStats,
  getSellerAnalytics,
  getAdminAnalytics,
} = require('../controllers/statsController');
const { verifyToken, verifyRole } = require('../middleware/auth');

router.get('/public', getPublicStats);
router.get('/categories', getCategoryStats);
router.get('/sellers', getTopSellers);
router.get('/admin', verifyToken, verifyRole('admin'), getAdminStats);
router.get('/admin/analytics', verifyToken, verifyRole('admin'), getAdminAnalytics);
router.get('/seller', verifyToken, verifyRole('seller', 'admin'), getSellerAnalytics);

module.exports = router;
