const express = require('express');
const router = express.Router();
const {
  createOrder,
  getBuyerOrders,
  getSellerOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const { verifyToken, verifyRole } = require('../middleware/auth');

router.post('/', verifyToken, verifyRole('buyer', 'admin'), createOrder);
router.get('/buyer', verifyToken, verifyRole('buyer', 'admin'), getBuyerOrders);
router.get('/seller', verifyToken, verifyRole('seller', 'admin'), getSellerOrders);
router.get('/admin', verifyToken, verifyRole('admin'), getAllOrders);
router.put('/:id/cancel', verifyToken, verifyRole('buyer', 'admin'), cancelOrder);
router.put('/:id/status', verifyToken, verifyRole('seller', 'admin'), updateOrderStatus);

module.exports = router;
