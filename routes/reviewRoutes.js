const express = require('express');
const router = express.Router();
const { getProductReviews, createReview } = require('../controllers/reviewController');
const { verifyToken, verifyRole } = require('../middleware/auth');

router.get('/product/:productId', getProductReviews);
router.post('/', verifyToken, verifyRole('buyer', 'admin'), createReview);

module.exports = router;
