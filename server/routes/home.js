const express = require('express');
const router = express.Router();
const { getHome } = require('../controllers/homeController');
const { verifyToken } = require('../middleware/auth');

// GET /api/home - korumalı endpoint
router.get('/', verifyToken, getHome);

module.exports = router; 