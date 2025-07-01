const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const { verifyToken } = require('../middleware/auth');

// Dinamik base URL belirleme fonksiyonu
const getBaseUrl = (req) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const protocol = req.protocol || 'https';
    const host = req.get('host') || 'depo.winghost.com.tr';
    
    if (isProduction) {
        return `${protocol}://${host}/server`;
    } else {
        return `${protocol}://${host}`;
    }
};

// Tek resim upload
router.post('/image', verifyToken, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Resim dosyası bulunamadı'
            });
        }

        const baseUrl = getBaseUrl(req);
        const imageUrl = `/uploads/${req.file.filename}`;
        const fullImageUrl = `${baseUrl}${imageUrl}`;

        res.json({
            success: true,
            message: 'Resim başarıyla yüklendi',
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                url: fullImageUrl,
                fullUrl: fullImageUrl,
                path: imageUrl
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Resim yüklenirken hata oluştu',
            error: error.message
        });
    }
});

// Çoklu resim upload
router.post('/images', verifyToken, upload.array('images', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Resim dosyası bulunamadı'
            });
        }

        const baseUrl = getBaseUrl(req);

        const uploadedFiles = req.files.map(file => {
            const imageUrl = `/uploads/${file.filename}`;
            const fullImageUrl = `${baseUrl}${imageUrl}`;
            
            return {
                filename: file.filename,
                originalName: file.originalname,
                size: file.size,
                url: fullImageUrl,
                fullUrl: fullImageUrl,
                path: imageUrl
            };
        });

        res.json({
            success: true,
            message: `${req.files.length} resim başarıyla yüklendi`,
            data: uploadedFiles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Resimler yüklenirken hata oluştu',
            error: error.message
        });
    }
});

module.exports = router; 