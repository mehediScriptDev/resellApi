const express = require('express');
const router = express.Router();
const {
  getMe,
  updateMe,
  becomeSeller,
  getAllUsers,
  updateUserStatus,
  deleteUser,
} = require('../controllers/userController');
const { verifyToken, verifyRole } = require('../middleware/auth');

router.get('/me', verifyToken, getMe);
router.put('/me', verifyToken, updateMe);
router.post('/me/become-seller', verifyToken, becomeSeller);
router.get('/', verifyToken, verifyRole('admin'), getAllUsers);
router.put('/:id/status', verifyToken, verifyRole('admin'), updateUserStatus);
router.delete('/:id', verifyToken, verifyRole('admin'), deleteUser);

module.exports = router;
