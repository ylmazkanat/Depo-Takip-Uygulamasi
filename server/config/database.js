require('dotenv').config({ path: './.env' });
const { Sequelize } = require('sequelize');

// Çevre değişkenlerini kontrol et
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD ?? '';
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;

// Çevre değişkenlerini kontrol et ve eksik olanları bildir
if (!DB_NAME) console.warn('⚠️  DB_NAME bilgisi env dosyasından alınamadı');
if (!DB_USER) console.warn('⚠️  DB_USER bilgisi env dosyasından alınamadı');
if (typeof process.env.DB_PASSWORD === 'undefined') {
    console.warn('⚠️  DB_PASSWORD env dosyasında tanımlı değil!');
} else if (DB_PASSWORD === '') {
    console.info('ℹ️  DB_PASSWORD env dosyasında boş bırakıldı (şifresiz bağlantı deneniyor).');
}
if (!DB_HOST) console.warn('⚠️  DB_HOST bilgisi env dosyasından alınamadı');
if (!DB_PORT) console.warn('⚠️  DB_PORT bilgisi env dosyasından alınamadı');

// Sequelize instance oluştur
const sequelize = new Sequelize(
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    {
        host: DB_HOST,
        port: DB_PORT,
        dialect: 'mysql',
        dialectOptions: {
            charset: 'utf8mb4',
            supportBigNumbers: true,
            bigNumberStrings: true,
            dateStrings: true,
            typeCast: true
        },
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci'
        },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: false,
        timezone: '+03:00'
    }
);

// Bağlantıyı test et
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        return true;
    } catch (error) {
        throw new Error('Database connection failed: ' + error.message);
    }
};

// Veritabanını senkronize et
const syncDatabase = async () => {
    try {
        await sequelize.sync({ force: false });
    } catch (error) {
        throw new Error('Database sync failed: ' + error.message);
    }
};

module.exports = {
    sequelize,
    testConnection,
    syncDatabase
}; 