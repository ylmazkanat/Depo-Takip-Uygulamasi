const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const Product = require('../models/Product');
const User = require('../models/User');

// Veritabanı bağlantısı kontrolü helper fonksiyonu
const checkDatabaseConnection = (res) => {
    if (!global.isDatabaseConnected) {
        res.status(503).json({
            success: false,
            message: 'Ürün işlemleri için veritabanı bağlantısı gereklidir',
            error: 'DATABASE_CONNECTION_FAILED',
            timestamp: new Date().toISOString()
        });
        return false;
    }
    return true;
};

// Tüm ürünleri getir (sayfalama ve filtreleme ile)
const getAllProducts = async (req, res) => {
    try {
        // Veritabanı bağlantısı kontrolü
        if (!checkDatabaseConnection(res)) return;

        const { 
            page = 1, 
            limit = 50, 
            status, 
            location,
            search,
            sortBy = 'name',
            sortOrder = 'ASC'
        } = req.query;

        const offset = (page - 1) * limit;
        const whereClause = { isActive: true };

        // Status filtresi
        if (status) {
            whereClause.status = status;
        }

        // Lokasyon filtresi
        if (location) {
            whereClause.location = location;
        }

        // Arama filtresi  
        if (search) {
            const searchTerm = search.toLowerCase().trim();
            
            // Türkçe karakter normalizasyonu
            const normalizeText = (text) => {
                return text
                    .toLowerCase()
                    .replace(/ğ/g, 'g')
                    .replace(/ü/g, 'u')
                    .replace(/ş/g, 's')
                    .replace(/ı/g, 'i')
                    .replace(/ö/g, 'o')
                    .replace(/ç/g, 'c');
            };
            
            const normalizedSearch = normalizeText(searchTerm);
            
            // Kelime bazlı arama ve kısmi eşleşme
            const searchConditions = [];
            
            // Normal arama (orijinal)
            searchConditions.push(
                { name: { [Op.like]: `%${searchTerm}%` } },
                { barcode: { [Op.like]: `%${searchTerm}%` } },
                { description: { [Op.like]: `%${searchTerm}%` } },
                { features: { [Op.like]: `%${searchTerm}%` } },
                { location: { [Op.like]: `%${searchTerm}%` } },
                { borrowedBy: { [Op.like]: `%${searchTerm}%` } }
            );
            
            // Normalize edilmiş arama (Türkçe karakter duyarsız)
            if (normalizedSearch !== searchTerm) {
                searchConditions.push(
                    { name: { [Op.like]: `%${normalizedSearch}%` } },
                    { description: { [Op.like]: `%${normalizedSearch}%` } },
                    { features: { [Op.like]: `%${normalizedSearch}%` } },
                    { location: { [Op.like]: `%${normalizedSearch}%` } }
                );
            }
            
            // Kelime kelime arama (hem orijinal hem normalize)
            const words = searchTerm.split(/\s+/).filter(word => word.length > 0);
            words.forEach(word => {
                if (word.length >= 1) { // En az 1 karakter
                    searchConditions.push(
                        { name: { [Op.like]: `%${word}%` } },
                        { description: { [Op.like]: `%${word}%` } },
                        { features: { [Op.like]: `%${word}%` } },
                        { location: { [Op.like]: `%${word}%` } }
                    );
                    
                    const normalizedWord = normalizeText(word);
                    if (normalizedWord !== word) {
                        searchConditions.push(
                            { name: { [Op.like]: `%${normalizedWord}%` } },
                            { description: { [Op.like]: `%${normalizedWord}%` } },
                            { features: { [Op.like]: `%${normalizedWord}%` } },
                            { location: { [Op.like]: `%${normalizedWord}%` } }
                        );
                    }
                }
            });
            
            whereClause[Op.or] = searchConditions;
        }

        const products = await Product.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, sortOrder.toUpperCase()]]
        });

        res.json({
            success: true,
            data: products.rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(products.count / limit),
                totalItems: products.count,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ürünler getirilemedi',
            error: error.message
        });
    }
};

// ID ile ürün getir
const getProductById = async (req, res) => {
    try {
        // Veritabanı bağlantısı kontrolü
        if (!checkDatabaseConnection(res)) return;
        
        const { id } = req.params;
        
        const product = await Product.findOne({
            where: { id, isActive: true }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Ürün bulunamadı'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ürün getirilemedi',
            error: error.message
        });
    }
};

// Barkod ile ürün getir
const getProductByBarcode = async (req, res) => {
    try {
        // Veritabanı bağlantısı kontrolü
        if (!checkDatabaseConnection(res)) return;
        
        const { barcode } = req.params;
        
        const product = await Product.findOne({
            where: { 
                barcode,
                isActive: true 
            }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Bu barkoda ait ürün bulunamadı'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Barkod ile ürün getirilemedi',
            error: error.message
        });
    }
};

// Yeni ürün ekle
const createProduct = async (req, res) => {
    try {
        // Veritabanı bağlantısı kontrolü
        if (!checkDatabaseConnection(res)) return;
        
        const {
            name,
            barcode,
            description,
            features,
            imageUrl,
            locationImage,
            location,
            locationDescription
        } = req.body;

        // Zorunlu alan kontrolü
        if (!name || name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Ürün adı en az 2 karakter olmalıdır'
            });
        }

        // Barkod benzersizlik kontrolü (varsa)
        if (barcode && barcode.trim()) {
            const existingProduct = await Product.findOne({
                where: { 
                    barcode: barcode.trim(),
                    isActive: true 
                }
            });
            if (existingProduct) {
                return res.status(400).json({
                    success: false,
                    message: 'Bu barkoda ait bir ürün zaten mevcut'
                });
            }
        }

        // Resim URL'leri için güvenlik kontrolü
        const sanitizeUrl = (url) => {
            if (!url) return null;
            const trimmedUrl = url.trim();
            
            // Base64 data URLs
            if (trimmedUrl.startsWith('data:image/')) {
                return trimmedUrl;
            }
            
            // HTTP/HTTPS URLs
            if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
                return trimmedUrl;
            }
            
            // Upload klasöründeki dosyalar (/uploads/ ile başlayan)
            if (trimmedUrl.startsWith('/uploads/')) {
                return trimmedUrl;
            }
            
            // Diğer relative path'ler
            if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./') || trimmedUrl.startsWith('../')) {
                return trimmedUrl;
            }
            
            return null;
        };

        const productData = {
            name: name.trim(),
            barcode: barcode?.trim() || null,
            description: description?.trim() || null,
            features: features?.trim() || null,
            imageUrl: sanitizeUrl(imageUrl),
            locationImage: sanitizeUrl(locationImage),
            location: location?.trim() || null,
            locationDescription: locationDescription?.trim() || null,
            status: 'in_stock'
        };

        const product = await Product.create(productData);

        res.status(201).json({
            success: true,
            message: 'Ürün başarıyla eklendi',
            data: product
        });
    } catch (error) {
        
        
        // Sequelize validation hataları için özel handling
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz veri',
                error: error.errors[0]?.message || 'Validasyon hatası'
            });
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Bu barkod zaten kullanılıyor',
                error: 'Barkod benzersiz olmalıdır'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Ürün eklenemedi',
            error: process.env.NODE_ENV === 'development' ? error.message : 'İç sunucu hatası'
        });
    }
};

// Ürün güncelle
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            barcode,
            description,
            features,
            imageUrl,
            locationImage,
            location,
            locationDescription
        } = req.body;

        const product = await Product.findOne({
            where: { id, isActive: true }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Ürün bulunamadı'
            });
        }

        // Barkod benzersizlik kontrolü (değiştiriliyorsa)
        if (barcode && barcode !== product.barcode) {
            const existingProduct = await Product.findByBarcode(barcode);
            if (existingProduct && existingProduct.id !== product.id) {
                return res.status(400).json({
                    success: false,
                    message: 'Bu barkoda ait bir ürün zaten mevcut'
                });
            }
        }

        // Resim URL'leri için güvenlik kontrolü
        const sanitizeUrl = (url, fallback) => {
            if (!url) return fallback;
            const trimmedUrl = url.trim();
            
            // Base64 data URLs
            if (trimmedUrl.startsWith('data:image/')) {
                return trimmedUrl;
            }
            
            // HTTP/HTTPS URLs
            if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
                return trimmedUrl;
            }
            
            // Upload klasöründeki dosyalar (/uploads/ ile başlayan)
            if (trimmedUrl.startsWith('/uploads/')) {
                return trimmedUrl;
            }
            
            // Diğer relative path'ler
            if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./') || trimmedUrl.startsWith('../')) {
                return trimmedUrl;
            }
            
            return fallback;
        };

        await product.update({
            name: name?.trim() || product.name,
            barcode: barcode?.trim() || product.barcode,
            description: description?.trim() || product.description,
            features: features?.trim() || product.features,
            imageUrl: sanitizeUrl(imageUrl, product.imageUrl),
            locationImage: sanitizeUrl(locationImage, product.locationImage),
            location: location?.trim() || product.location,
            locationDescription: locationDescription?.trim() || product.locationDescription
        });

        res.json({
            success: true,
            message: 'Ürün başarıyla güncellendi',
            data: product
        });
    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Ürün güncellenemedi',
            error: error.message
        });
    }
};

// Ürün sil (soft delete)
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findOne({
            where: { id, isActive: true }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Ürün bulunamadı'
            });
        }

        await product.update({ isActive: false });

        res.json({
            success: true,
            message: 'Ürün başarıyla silindi'
        });
    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Ürün silinemedi',
            error: error.message
        });
    }
};

// Ürün ödünç ver
const borrowProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { borrowedBy, borrowedByUserId } = req.body;

        if (!borrowedBy || borrowedBy.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Ödünç alan kişinin adı girilmelidir'
            });
        }

        const product = await Product.findOne({
            where: { id, isActive: true }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Ürün bulunamadı'
            });
        }

        if (product.status === 'borrowed') {
            return res.status(400).json({
                success: false,
                message: 'Bu ürün zaten ödünç alınmış'
            });
        }

        // Kullanıcı ID kontrolü (varsa)
        if (borrowedByUserId) {
            const user = await User.findOne({
                where: { id: borrowedByUserId, isActive: true }
            });
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Belirtilen kullanıcı bulunamadı'
                });
            }
        }

        await product.update({
            status: 'borrowed',
            borrowedBy: borrowedBy.trim(),
            borrowedByUserId: borrowedByUserId || null,
            borrowedDate: new Date(),
            returnDate: null
        });

        res.json({
            success: true,
            message: 'Ürün başarıyla ödünç verildi',
            data: product
        });
    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Ürün ödünç verilemedi',
            error: error.message
        });
    }
};

// Ürün geri al
const returnProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { location, locationDescription, locationImage } = req.body;

        // ID validasyonu
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz ürün ID'
            });
        }

        const product = await Product.findOne({
            where: { id, isActive: true }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Ürün bulunamadı'
            });
        }

        if (product.status === 'in_stock') {
            return res.status(400).json({
                success: false,
                message: 'Bu ürün zaten depoda mevcut'
            });
        }

        // Resim URL'leri için güvenlik kontrolü
        const sanitizeUrl = (url, fallback) => {
            if (!url) return fallback;
            const trimmedUrl = url.trim();
            
            // Base64 data URLs
            if (trimmedUrl.startsWith('data:image/')) {
                return trimmedUrl;
            }
            
            // HTTP/HTTPS URLs
            if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
                return trimmedUrl;
            }
            
            // Upload klasöründeki dosyalar (/uploads/ ile başlayan)
            if (trimmedUrl.startsWith('/uploads/')) {
                return trimmedUrl;
            }
            
            // Diğer relative path'ler
            if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./') || trimmedUrl.startsWith('../')) {
                return trimmedUrl;
            }
            
            return fallback;
        };

        const updateData = {
            status: 'in_stock',
            borrowedBy: null,
            borrowedByUserId: null,
            borrowedDate: null,
            returnDate: new Date()
        };

        // Sadece gönderilmiş alanları güncelle
        if (location !== undefined) {
            updateData.location = location?.trim() || product.location;
        }
        if (locationDescription !== undefined) {
            updateData.locationDescription = locationDescription?.trim() || product.locationDescription;
        }
        if (locationImage !== undefined) {
            updateData.locationImage = sanitizeUrl(locationImage, product.locationImage);
        }

        await product.update(updateData);

        // Güncellenmiş ürünü tekrar getir
        const updatedProduct = await Product.findByPk(id);

        res.json({
            success: true,
            message: 'Ürün başarıyla geri alındı',
            data: updatedProduct
        });
    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Ürün geri alınamadı',
            error: process.env.NODE_ENV === 'development' ? error.message : 'İç sunucu hatası'
        });
    }
};

// Konum kategorilerini getir
const getLocationCategories = async (req, res) => {
    try {
        const locations = await Product.findAll({
            attributes: ['location'],
            where: { 
                isActive: true,
                location: { [Op.ne]: null }
            },
            group: ['location'],
            raw: true
        });

        const locationList = locations
            .map(item => item.location)
            .filter(location => location && location.trim())
            .sort();

        res.json({
            success: true,
            data: locationList
        });
    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Konum kategorileri getirilemedi',
            error: error.message
        });
    }
};

// İstatistikler
const getProductStats = async (req, res) => {
    try {
        const totalCount = await Product.count({ where: { isActive: true } });
        const inStockCount = await Product.count({ 
            where: { status: 'in_stock', isActive: true } 
        });
        const borrowedCount = await Product.count({ 
            where: { status: 'borrowed', isActive: true } 
        });

        const recentProducts = await Product.findAll({
            where: { isActive: true },
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        const recentBorrows = await Product.findAll({
            where: { 
                status: 'borrowed', 
                isActive: true 
            },
            order: [['borrowedDate', 'DESC']],
            limit: 5
        });

        res.json({
            success: true,
            data: {
                totalCount,
                inStockCount,
                borrowedCount,
                recentProducts,
                recentBorrows
            }
        });
    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'İstatistikler getirilemedi',
            error: error.message
        });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    getProductByBarcode,
    createProduct,
    updateProduct,
    deleteProduct,
    borrowProduct,
    returnProduct,
    getLocationCategories,
    getProductStats
}; 
