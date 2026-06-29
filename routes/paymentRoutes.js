const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  savePayment,
  getBuyerPayments,
  getAdminPayments,
} = require('../controllers/paymentController');
const { verifyToken, verifyRole } = require('../middleware/auth');

router.post('/create-intent', verifyToken, createPaymentIntent);
router.post('/save', verifyToken, savePayment);
router.get('/', verifyToken, verifyRole('buyer', 'admin'), getBuyerPayments);
router.get('/admin', verifyToken, verifyRole('admin'), getAdminPayments);

module.exports = router;
