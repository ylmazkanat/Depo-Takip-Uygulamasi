const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
    getLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    toggleLocationStatus
} = require('../controllers/locationController');

// Tüm route'lar authenticate edilmiş olmalı
router.use(verifyToken);

// GET /api/locations - Tüm konumları getir (arama desteği ile)
router.get('/', getLocations);

// POST /api/locations - Yeni konum ekle
router.post('/', createLocation);

// PUT /api/locations/:id - Konum güncelle
router.put('/:id', updateLocation);

// PATCH /api/locations/:id/toggle - Konum aktif/pasif durumunu değiştir
router.patch('/:id/toggle', toggleLocationStatus);

// DELETE /api/locations/:id - Konum sil (kalıcı silme)
router.delete('/:id', deleteLocation);

module.exports = router; 