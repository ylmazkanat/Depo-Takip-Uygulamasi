const jwt = require('jsonwebtoken');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

// JWT token oluştur
const generateToken = (userId, email, name) => {
    if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET env dosyasından okunamadı, token oluşturulamıyor');
        throw new Error('JWT_SECRET bulunamadı');
    }
    
    return jwt.sign(
        { userId, email, name },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Veritabanı bağlantısı kontrolü
const checkDatabaseAndRespond = (res, message = 'Veritabanı bağlantısı mevcut değil') => {
    if (!global.isDatabaseConnected) {
        return res.status(503).json({
            success: false,
            message,
            error: 'DATABASE_CONNECTION_FAILED',
            timestamp: new Date().toISOString()
        });
    }
    return null;
};

// Kullanıcı kayıt olma
const register = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Gerekli alanları kontrol et
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Tüm alanları doldurunuz'
            });
        }

        // Şifre doğrulaması
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Şifreler eşleşmiyor'
            });
        }

        // Şifre uzunluğu kontrolü
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Şifre en az 6 karakter olmalıdır'
            });
        }

        // Veritabanı bağlantısı kontrolü
        if (!global.isDatabaseConnected) {
            return res.status(503).json({
                success: false,
                message: 'Kayıt işlemi için veritabanı bağlantısı gereklidir',
                error: 'DATABASE_CONNECTION_FAILED'
            });
        }

        // Email daha önce kullanılmış mı kontrol et
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Bu email adresi zaten kullanılıyor'
            });
        }

        // Yeni kullanıcı oluştur
        const user = await User.createUser({
            name,
            email,
            password,
            role: 'user'
        });

        // JWT token oluştur
        const token = generateToken(user.id, user.email, user.name);

        res.status(201).json({
            success: true,
            message: 'Kayıt başarılı',
            token,
            user: user.toJSON()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Kayıt olurken bir hata oluştu',
            error: error.message
        });
    }
};

// Kullanıcı girişi
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Gerekli alanları kontrol et
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email ve şifre gereklidir'
            });
        }

        // Veritabanı bağlantısı kontrolü
        if (!global.isDatabaseConnected) {
            return res.status(503).json({
                success: false,
                message: 'Giriş işlemi için veritabanı bağlantısı gereklidir',
                error: 'DATABASE_CONNECTION_FAILED'
            });
        }

        // Veritabanı bağlantısı varsa normal işlem
        const user = await User.findByEmail(email);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz email veya şifre'
            });
        }

        // Şifre kontrolü
        const isValidPassword = await user.comparePassword(password);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz email veya şifre'
            });
        }

        // Son giriş zamanını güncelle
        await user.update({ lastLogin: new Date() });

        // JWT token oluştur
        const token = generateToken(user.id, user.email, user.name);

        res.json({
            success: true,
            message: 'Giriş başarılı',
            token,
            user: user.toJSON()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Giriş işlemi sırasında hata oluştu',
            error: error.message
        });
    }
};

// Kullanıcı çıkışı
const logout = (req, res) => {
    res.json({
        success: true,
        message: 'Çıkış başarılı'
    });
};

// Mevcut kullanıcı bilgilerini getir
const getMe = async (req, res) => {
    try {
        const user = req.user;
        
        // Veritabanı bağlantısı yoksa req.user'dan gelen bilgiyi kullan
        if (!global.isDatabaseConnected) {
            return res.json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role || 'user'
                },
                warning: 'Veritabanı bağlantısı olmadığı için sınırlı bilgi gösteriliyor'
            });
        }
        
        res.json({
            success: true,
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Kullanıcı bilgileri alınırken hata oluştu',
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    getMe
}; 
