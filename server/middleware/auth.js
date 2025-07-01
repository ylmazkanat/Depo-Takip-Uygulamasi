const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Veritabanı durumu kontrolü middleware'i
const checkDatabaseConnection = (req, res, next) => {
    if (!global.isDatabaseConnected) {
        return res.status(503).json({
            success: false,
            message: 'Veritabanı bağlantısı mevcut değil. Lütfen sistem yöneticisi ile iletişime geçin.',
            error: 'DATABASE_CONNECTION_FAILED',
            timestamp: new Date().toISOString()
        });
    }
    next();
};

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token bulunamadı'
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error('❌ JWT_SECRET env dosyasından okunamadı, token doğrulanamıyor');
            return res.status(500).json({
                success: false,
                message: 'Sunucu yapılandırma hatası'
            });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Veritabanı bağlantısı varsa kullanıcıyı kontrol et
        if (global.isDatabaseConnected) {
            const user = await User.findByPk(decoded.userId);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Geçersiz token - kullanıcı bulunamadı'
                });
            }
            req.user = user;
        } else {
            // Veritabanı yoksa token'dan gelen bilgiyi kullan
            req.user = { 
                id: decoded.userId, 
                email: decoded.email,
                name: decoded.name || 'Test User',
                role: decoded.role || 'admin'
            };
        }
        
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Geçersiz token',
            error: error.message
        });
    }
};

// Admin kontrolü için middleware
const adminMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Kimlik doğrulama gerekli'
            });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bu işlem için admin yetkisi gerekli'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Yetkilendirme hatası'
        });
    }
};

// Kullanıcı veya admin yetkisi kontrolü
const userOrAdminMiddleware = (req, res, next) => {
    if (req.user && (req.user.role === 'user' || req.user.role === 'admin')) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Bu işlem için giriş yapmış kullanıcı olmalısınız.'
        });
    }
};

module.exports = {
    verifyToken,
    checkDatabaseConnection,
    adminMiddleware,
    userOrAdminMiddleware
}; 