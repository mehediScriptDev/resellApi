const express = require('express');
const router = express.Router();
const {
  getWishlist,
  getWishlistCount,
  addToWishlist,
  removeFromWishlist,
} = require('../controllers/wishlistController');
const { verifyToken, verifyRole } = require('../middleware/auth');

router.get('/', verifyToken, verifyRole('buyer', 'admin'), getWishlist);
router.get('/count', verifyToken, verifyRole('buyer', 'admin'), getWishlistCount);
router.post('/', verifyToken, verifyRole('buyer', 'admin'), addToWishlist);
router.delete('/:productId', verifyToken, verifyRole('buyer', 'admin'), removeFromWishlist);

module.exports = router;
