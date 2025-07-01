require('dotenv').config({ path: './.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./config/database');

// Çevre değişkenlerini kontrol et
if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET bilgisi env dosyasından alınamadı');
}

if (!process.env.PORT) {
    console.warn('⚠️  PORT bilgisi env dosyasından alınamadı');
}

if (!process.env.NODE_ENV) {
    console.warn('⚠️  NODE_ENV bilgisi env dosyasından alınamadı');
}

// Global veritabanı durumu
global.isDatabaseConnected = false;

// Routes
const authRoutes = require('./routes/auth');
const homeRoutes = require('./routes/home');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const locationRoutes = require('./routes/locations');

const app = express();
const PORT = process.env.PORT || 5000;

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';

// CORS configuration
const corsOptions = {
    origin: isProduction ? 'https://depo.winghost.com.tr' : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Passenger BaseURI prefix detection
const getBasePrefix = (req) => {
    // Passenger BaseURI kontrolü
    if (req.headers['x-passenger-base-uri'] || process.env.PASSENGER_BASE_URI) {
        return '/server';
    }
    return '';
};

// Static files - uploads servisi
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/server/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes - Hem normal hem de /server prefix'li
app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/locations', locationRoutes);

// Passenger için /server prefix'li route'lar
app.use('/server/api/auth', authRoutes);
app.use('/server/api/home', homeRoutes);
app.use('/server/api/products', productRoutes);
app.use('/server/api/admin', adminRoutes);
app.use('/server/api/upload', uploadRoutes);
app.use('/server/api/locations', locationRoutes);

// Health check endpoints
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Depo Yönetim Sistemi API',
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'unknown',
        basePrefix: getBasePrefix(req),
        databaseStatus: global.isDatabaseConnected ? 'connected' : 'disconnected',
        endpoints: {
            auth: '/api/auth',
            home: '/api/home',
            products: '/api/products',
            admin: '/api/admin',
            upload: '/api/upload',
            locations: '/api/locations'
        },
        timestamp: new Date().toISOString()
    });
});

app.get('/server', (req, res) => {
    res.json({
        success: true,
        message: 'Depo Yönetim Sistemi API',
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'unknown',
        basePrefix: '/server',
        databaseStatus: global.isDatabaseConnected ? 'connected' : 'disconnected',
        endpoints: {
            auth: '/server/api/auth',
            home: '/server/api/home',
            products: '/server/api/products',
            admin: '/server/api/admin',
            upload: '/server/api/upload',
            locations: '/server/api/locations'
        },
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        headers: req.headers,
        timestamp: new Date().toISOString()
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: isProduction ? 'Internal server error' : error.message,
        timestamp: new Date().toISOString()
    });
});

// Start server
async function startServer() {
    try {
        // Veritabanı bağlantısını deneyelim ama başarısız olursa da devam edelim
        try {
            await sequelize.authenticate();
            console.log('✅ Database connected successfully');
            global.isDatabaseConnected = true;
            
            await sequelize.sync({ alter: false });
            console.log('✅ Database synchronized');
        } catch (dbError) {
            console.warn('⚠️  Database connection failed:', dbError.message);
            console.warn('⚠️  Server will continue without database connection');
            global.isDatabaseConnected = false;
        }

        if (!isProduction) {
            app.listen(PORT, () => {
                console.log(`🚀 Server running on port ${PORT}`);
                console.log(`📌 Environment: ${process.env.NODE_ENV || 'unknown'}`);
                console.log(`💾 Database status: ${global.isDatabaseConnected ? 'Connected' : 'Disconnected'}`);
                console.log(`🌐 API available at: http://localhost:${PORT}`);
            });
        }
    } catch (error) {
        console.error('❌ Server start error:', error);
        process.exit(1);
    }
}

// Export for Passenger
module.exports = app;

// Start server in development
if (!isProduction) {
    startServer();
} 