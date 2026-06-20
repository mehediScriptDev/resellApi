const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { verifyToken, verifyRole } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', verifyToken, verifyRole('seller', 'admin'), createProduct);
router.put('/:id', verifyToken, verifyRole('seller', 'admin'), updateProduct);
router.delete('/:id', verifyToken, verifyRole('seller', 'admin'), deleteProduct);

module.exports = router;
