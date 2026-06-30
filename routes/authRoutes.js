const express = require('express');
const router = express.Router();
const { register, login, getMe, googleAuth, googleCallback, googleSync } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.post('/google-sync', googleSync);

module.exports = router;
