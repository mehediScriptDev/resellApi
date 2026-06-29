const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getSellerProducts,
  getAdminProducts,
  createProduct,
  updateProduct,
  moderateProduct,
  deleteProduct,
  incrementViews,
  getFees,
} = require('../controllers/productController');
const { verifyToken, verifyRole } = require('../middleware/auth');

router.get('/fees', getFees);
router.get('/seller/mine', verifyToken, verifyRole('seller', 'admin'), getSellerProducts);
router.get('/admin/all', verifyToken, verifyRole('admin'), getAdminProducts);
router.get('/', getProducts);
router.post('/:id/view', incrementViews);
router.get('/:id', getProductById);
router.post('/', verifyToken, verifyRole('seller', 'admin'), createProduct);
router.put('/:id/moderate', verifyToken, verifyRole('admin'), moderateProduct);
router.put('/:id', verifyToken, verifyRole('seller', 'admin'), updateProduct);
router.delete('/:id', verifyToken, verifyRole('seller', 'admin'), deleteProduct);

module.exports = router;
