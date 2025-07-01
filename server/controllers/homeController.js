const { Product } = require('../models');

// Ana sayfa verilerini getir (korumalı endpoint)
const getHome = async (req, res) => {
    try {
        // Auth middleware sayesinde req.user mevcut
        const user = req.user;

        // Veritabanı bağlantısı yoksa test verisi döndür
        if (!global.isDatabaseConnected) {
            return res.json({
                success: true,
                message: `Hoş geldin, ${user.name}!`,
                data: {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role || 'user'
                    },
                    welcomeMessage: `Merhaba ${user.name}, Depo Yönetim Sistemi'ne hoş geldiniz!`,
                    timestamp: new Date().toISOString(),
                    stats: {
                        totalProducts: 0,
                        inStockCount: 0,
                        borrowedCount: 0,
                        availabilityRate: 0
                    },
                    recentProducts: [],
                    recentlyBorrowed: []
                },
                warning: 'Veritabanı bağlantısı olmadığı için test verileri gösteriliyor'
            });
        }

        // Depo istatistiklerini getir
        const totalProducts = await Product.count({
            where: { isActive: true }
        });
        
        const inStockCount = await Product.count({
            where: { status: 'in_stock', isActive: true }
        });
        
        const borrowedCount = await Product.count({
            where: { status: 'borrowed', isActive: true }
        });
        
        // Son eklenen ürünler
        const recentProducts = await Product.findAll({
            where: { isActive: true },
            order: [['createdAt', 'DESC']],
            limit: 5
        });
        
        // Son ödünç alınan ürünler
        const recentlyBorrowed = await Product.findAll({
            where: { 
                status: 'borrowed', 
                isActive: true 
            },
            order: [['borrowedDate', 'DESC']],
            limit: 5
        });

        res.json({
            success: true,
            message: `Hoş geldin, ${user.name}!`,
            data: {
                user: user.toJSON(),
                welcomeMessage: `Merhaba ${user.name}, Depo Yönetim Sistemi'ne hoş geldiniz!`,
                timestamp: new Date().toISOString(),
                stats: {
                    totalProducts,
                    inStockCount,
                    borrowedCount,
                    availabilityRate: totalProducts > 0 ? Math.round((inStockCount / totalProducts) * 100) : 0
                },
                recentProducts,
                recentlyBorrowed
            }
        });

    } catch (error) {
        console.error('Home controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası',
            error: error.message
        });
    }
};

module.exports = {
    getHome
}; 
