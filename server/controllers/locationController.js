const { Location } = require('../models');
const { Op } = require('sequelize');

// Tüm konumları getir
const getLocations = async (req, res) => {
    try {
        const { search, activeOnly } = req.query;
        
        let whereCondition = {};
        
        // Sadece aktif konumları getir parametresi varsa
        if (activeOnly === 'true') {
            whereCondition.isActive = true;
        }
        
        // Arama filtresi varsa ekle
        if (search && search.trim()) {
            whereCondition.name = {
                [Op.iLike]: `%${search.trim()}%`
            };
        }
        
        const locations = await Location.findAll({
            where: whereCondition,
            order: [['createdAt', 'DESC']]
        });
        
        res.json({
            success: true,
            data: locations
        });
    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Konumlar getirilirken hata oluştu',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Yeni konum ekle
const createLocation = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Konum adı zorunludur'
            });
        }
        
        // Aynı isimde konum var mı kontrol et
        const existingLocation = await Location.findOne({
            where: { name: name.trim() }
        });
        
        if (existingLocation) {
            return res.status(400).json({
                success: false,
                message: 'Bu isimde bir konum zaten mevcut'
            });
        }
        
        const location = await Location.create({
            name: name.trim(),
            description: description?.trim() || null
        });
        
        res.status(201).json({
            success: true,
            message: 'Konum başarıyla oluşturuldu',
            data: location
        });
    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Konum oluşturulurken hata oluştu',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Konum güncelle
const updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, isActive } = req.body;
        
        const location = await Location.findByPk(id);
        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Konum bulunamadı'
            });
        }
        
        if (name && name.trim()) {
            // Aynı isimde başka konum var mı kontrol et
            const existingLocation = await Location.findOne({
                where: { 
                    name: name.trim(),
                    id: { [Op.ne]: id }
                }
            });
            
            if (existingLocation) {
                return res.status(400).json({
                    success: false,
                    message: 'Bu isimde bir konum zaten mevcut'
                });
            }
        }
        
        await location.update({
            name: name?.trim() || location.name,
            description: description?.trim() || location.description,
            isActive: isActive !== undefined ? isActive : location.isActive
        });
        
        res.json({
            success: true,
            message: 'Konum başarıyla güncellendi',
            data: location
        });
    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Konum güncellenirken hata oluştu',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Konum aktif/pasif durumunu toggle et
const toggleLocationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        const location = await Location.findByPk(id);
        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Konum bulunamadı'
            });
        }
        
        await location.update({ isActive: !location.isActive });
        
        res.json({
            success: true,
            message: `Konum başarıyla ${location.isActive ? 'aktif' : 'pasif'} hale getirildi`,
            data: location
        });
    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Konum durumu değiştirilirken hata oluştu',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Konum sil (hard delete - kalıcı silme)
const deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;
        
        const location = await Location.findByPk(id);
        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Konum bulunamadı'
            });
        }
        
        // Kalıcı olarak sil
        await location.destroy();
        
        res.json({
            success: true,
            message: 'Konum kalıcı olarak silindi'
        });
    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Konum silinirken hata oluştu',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    getLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    toggleLocationStatus
}; 
