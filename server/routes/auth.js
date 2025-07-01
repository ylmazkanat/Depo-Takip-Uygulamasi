const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/authController');
const { getAllUsers } = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

// Test endpoint
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Auth route çalışıyor'
    });
});

// Login endpoint
router.post('/login', login);

// Register endpoint
router.post('/register', register);

// Logout endpoint (sadece frontend için)
router.post('/logout', logout);

// Kullanıcı bilgilerini getir (korumalı route)
router.get('/me', verifyToken, getMe);

// Tüm kullanıcıları getir (normal kullanıcılar için)
router.get('/users', verifyToken, getAllUsers);

module.exports = router; 