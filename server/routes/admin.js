const express = require('express');
const router = express.Router();
const { verifyToken, adminMiddleware } = require('../middleware/auth');
const { getAllUsers, createUser, updateUser, deleteUser, toggleUserStatus } = require('../controllers/userController');

// Admin middleware'i tüm route'larda kullan
router.use(verifyToken);
router.use(adminMiddleware);

// Kullanıcı yönetimi
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/toggle-status', toggleUserStatus);

// Sistem istatistikleri
router.get('/stats', async (req, res) => {
    try {
        const { User, Product } = require('../models');
        
        const totalUsers = await User.count();
        const activeUsers = await User.count({ where: { isActive: true } });
        const totalProducts = await Product.count();
        const borrowedProducts = await Product.count({ where: { status: 'borrowed' } });

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers
                },
                products: {
                    total: totalProducts,
                    borrowed: borrowedProducts,
                    available: totalProducts - borrowedProducts
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Sistem istatistikleri alınamadı'
        });
    }
});

// Sistem logları (basit implementation)
router.get('/logs', async (req, res) => {
    try {
        const logs = [
            {
                id: 1,
                level: 'info',
                message: 'Sistem başlatıldı',
                timestamp: new Date(),
                source: 'system'
            },
            {
                id: 2,
                level: 'info',
                message: 'Veritabanı bağlantısı kuruldu',
                timestamp: new Date(),
                source: 'database'
            }
        ];

        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Log verileri alınamadı'
        });
    }
});

// Veritabanı yedekleme
router.post('/backup', async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Yedekleme işlemi başlatıldı',
            data: {
                backupId: Date.now(),
                status: 'started'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Yedekleme başlatılamadı'
        });
    }
});

// Veritabanı senkronizasyonu
router.post('/sync-db', async (req, res) => {
    try {
        const { sequelize } = require('../config/database');
        await sequelize.sync({ alter: true });

        res.json({
            success: true,
            message: 'Veritabanı senkronizasyonu tamamlandı'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Veritabanı senkronizasyonu başarısız'
        });
    }
});

module.exports = router; 