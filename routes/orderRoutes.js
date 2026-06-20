const express = require('express');
const router = express.Router();
const { createOrder, getBuyerOrders, getSellerOrders, updateOrderStatus } = require('../controllers/orderController');
const { verifyToken, verifyRole } = require('../middleware/auth');

router.post('/', verifyToken, createOrder);
router.get('/buyer', verifyToken, verifyRole('buyer', 'admin'), getBuyerOrders);
router.get('/seller', verifyToken, verifyRole('seller', 'admin'), getSellerOrders);
router.put('/:id/status', verifyToken, verifyRole('seller', 'admin'), updateOrderStatus);

module.exports = router;
