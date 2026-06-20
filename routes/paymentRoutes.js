const express = require('express');
const router = express.Router();
const { createPaymentIntent, savePayment } = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');

router.post('/create-intent', verifyToken, createPaymentIntent);
router.post('/save', verifyToken, savePayment);

module.exports = router;
