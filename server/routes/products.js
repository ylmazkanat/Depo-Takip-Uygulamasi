const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/productController');
const { verifyToken } = require('../middleware/auth');

// Public endpoints (auth gerekmez)
// GET /api/products/stats - İstatistikler (public)
router.get('/stats', getProductStats);

// GET /api/products/locations - Konum kategorilerini getir (public)
router.get('/locations', getLocationCategories);

// Auth gerektiren tüm diğer routes
router.use(verifyToken);

// GET /api/products - Tüm ürünleri getir
router.get('/', getAllProducts);

// GET /api/products/barcode/:barcode - Barkod ile ürün getir
router.get('/barcode/:barcode', getProductByBarcode);

// GET /api/products/:id - ID ile ürün getir
router.get('/:id', getProductById);

// POST /api/products - Yeni ürün ekle
router.post('/', createProduct);

// PUT /api/products/:id - Ürün güncelle
router.put('/:id', updateProduct);

// POST /api/products/:id/borrow - Ürün ödünç ver
router.post('/:id/borrow', borrowProduct);

// POST /api/products/:id/return - Ürün geri al
router.post('/:id/return', returnProduct);

// DELETE /api/products/:id - Ürün sil
router.delete('/:id', deleteProduct);

module.exports = router; 