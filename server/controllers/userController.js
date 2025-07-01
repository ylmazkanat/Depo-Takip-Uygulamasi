const { User } = require('../models');
const { Op } = require('sequelize');

// Tüm kullanıcıları getir (sadece admin)
const getAllUsers = async (req, res) => {
    try {
        const { 
            search, 
            role, 
            isActive,
            sortBy = 'createdAt', 
            sortOrder = 'DESC',
            page = 1,
            limit = 50
        } = req.query;

        const whereClause = {};

        // Arama
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        // Rol filtresi
        if (role) {
            whereClause.role = role;
        }

        // Aktiflik filtresi
        if (isActive !== undefined) {
            whereClause.isActive = isActive === 'true';
        }

        const offset = (page - 1) * limit;

        const users = await User.findAndCountAll({
            where: whereClause,
            order: [[sortBy, sortOrder.toUpperCase()]],
            limit: parseInt(limit),
            offset: parseInt(offset),
            attributes: { exclude: ['password'] } // Şifreleri döndürme
        });

        res.json({
            success: true,
            data: users.rows,
            pagination: {
                total: users.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(users.count / limit)
            }
        });
    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Kullanıcılar yüklenirken bir hata oluştu',
            error: error.message
        });
    }
};

// Tek kullanıcı getir (sadece admin)
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findOne({
            where: { id },
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Kullanıcı yüklenirken bir hata oluştu',
            error: error.message
        });
    }
};

// Yeni kullanıcı oluştur (sadece admin)
const createUser = async (req, res) => {
    try {
        const { name, email, password, role = 'user' } = req.body;

        // Validation
        if (!name?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'İsim gereklidir'
            });
        }

        if (!email?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'E-posta gereklidir'
            });
        }

        if (!password?.trim() || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Şifre en az 6 karakter olmalıdır'
            });
        }

        // E-posta kontrolü
        const existingUser = await User.findOne({ where: { email: email.trim() } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Bu e-posta adresi zaten kullanılıyor'
            });
        }

        const userData = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: password.trim(),
            role: ['admin', 'user'].includes(role) ? role : 'user',
            isActive: true
        };

        const user = await User.create(userData);

        // Şifreyi response'dan çıkar
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            data: userResponse,
            message: 'Kullanıcı başarıyla oluşturuldu'
        });
    } catch (error) {
        
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Bu e-posta adresi zaten kullanılıyor'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Kullanıcı oluşturulurken bir hata oluştu',
            error: error.message
        });
    }
};

// Kullanıcı güncelle (sadece admin)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, isActive } = req.body;

        const user = await User.findOne({ where: { id } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        // Kendi kendini deaktif etmeyi engelle
        if (req.user.id === parseInt(id) && isActive === false) {
            return res.status(400).json({
                success: false,
                message: 'Kendi hesabınızı deaktif edemezsiniz'
            });
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name?.trim();
        if (email !== undefined) {
            updateData.email = email?.trim().toLowerCase();
            
            // E-posta benzersizlik kontrolü
            if (email !== user.email) {
                const existingUser = await User.findOne({ 
                    where: { 
                        email: email.trim().toLowerCase(),
                        id: { [Op.ne]: id }
                    } 
                });
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        message: 'Bu e-posta adresi zaten kullanılıyor'
                    });
                }
            }
        }
        if (role !== undefined && ['admin', 'user'].includes(role)) {
            updateData.role = role;
        }
        if (isActive !== undefined) updateData.isActive = isActive;

        await user.update(updateData);

        // Şifreyi response'dan çıkar
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.json({
            success: true,
            data: userResponse,
            message: 'Kullanıcı başarıyla güncellendi'
        });
    } catch (error) {
        
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Bu e-posta adresi zaten kullanılıyor'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Kullanıcı güncellenirken bir hata oluştu',
            error: error.message
        });
    }
};

// Kullanıcı sil (sadece admin)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findOne({ where: { id } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        // Kendi kendini silmeyi engelle
        if (req.user.id === parseInt(id)) {
            return res.status(400).json({
                success: false,
                message: 'Kendi hesabınızı silemezsiniz'
            });
        }

        // Soft delete
        await user.update({ isActive: false });

        res.json({
            success: true,
            message: 'Kullanıcı başarıyla silindi'
        });
    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Kullanıcı silinirken bir hata oluştu',
            error: error.message
        });
    }
};

// Kullanıcı durumunu değiştir (aktif/pasif)
const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findOne({ where: { id } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        // Kendi kendini deaktif etmeyi engelle
        if (req.user.id === parseInt(id) && user.isActive === true) {
            return res.status(400).json({
                success: false,
                message: 'Kendi hesabınızı deaktif edemezsiniz'
            });
        }

        await user.update({ isActive: !user.isActive });

        // Şifreyi response'dan çıkar
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.json({
            success: true,
            data: userResponse,
            message: `Kullanıcı ${user.isActive ? 'aktif' : 'pasif'} hale getirildi`
        });
    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Kullanıcı durumu değiştirilirken bir hata oluştu',
            error: error.message
        });
    }
};

// Kullanıcı istatistikleri (sadece admin)
const getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const activeUsers = await User.count({ where: { isActive: true } });
        const adminUsers = await User.count({ where: { role: 'admin', isActive: true } });
        const regularUsers = await User.count({ where: { role: 'user', isActive: true } });

        res.json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                inactiveUsers: totalUsers - activeUsers,
                adminUsers,
                regularUsers
            }
        });
    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'İstatistikler yüklenirken bir hata oluştu',
            error: error.message
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getUserStats
}; 
