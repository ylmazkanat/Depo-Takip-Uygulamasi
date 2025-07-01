const { sequelize } = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const Location = require('./Location');

// Model ilişkileri
User.hasMany(Product, { 
    foreignKey: 'borrowedByUserId',
    as: 'borrowedProducts'
});

Product.belongsTo(User, { 
    foreignKey: 'borrowedByUserId',
    as: 'borrower'
});

// Veritabanı senkronizasyonu
const syncModels = async () => {
    try {
        await sequelize.sync({ force: false });
        console.log('✅ Tüm modeller veritabanı ile senkronize edildi');
    } catch (error) {
        console.error('❌ Model senkronizasyon hatası:', error);
        throw error;
    }
};

module.exports = {
    sequelize,
    User,
    Product,
    Location,
    syncModels
}; 