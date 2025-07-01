const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 255]
        }
    },
    barcode: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Ürün barkod veya QR kod bilgisi'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    features: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    imageUrl: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    locationImage: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Konumun fotoğrafı'
    },
    status: {
        type: DataTypes.ENUM('in_stock', 'borrowed'),
        defaultValue: 'in_stock',
        allowNull: false
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Depo içindeki konum kategorisi (Sütun 1, Sütun 2, vb.)'
    },
    locationDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Konumu bulmak için detaylı açıklama'
    },
    borrowedBy: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Ürünü alan kişinin adı'
    },
    borrowedByUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Kayıtlı kullanıcı ID\'si (varsa)'
    },
    borrowedDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Ürünün alınma tarihi'
    },
    returnDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Ürünün geri verilme tarihi'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    }
}, {
    tableName: 'products',
    timestamps: true,
    indexes: [
        {
            fields: ['name']
        },
        {
            fields: ['barcode']
        },
        {
            fields: ['status']
        },
        {
            fields: ['location']
        },
        {
            fields: ['borrowedBy']
        },
        {
            fields: ['borrowedByUserId']
        }
    ],
    hooks: {
        beforeUpdate: (product) => {
            // Eğer durum in_stock olarak değiştiriliyorsa borrowed bilgilerini temizle
            if (product.status === 'in_stock') {
                product.borrowedBy = null;
                product.borrowedByUserId = null;
                product.borrowedDate = null;
                product.returnDate = new Date();
            }
        }
    }
});

// Class metodları
Product.findByStatus = async function(status) {
    return await Product.findAll({
        where: { status, isActive: true },
        order: [['name', 'ASC']]
    });
};

Product.findByBarcode = async function(barcode) {
    return await Product.findOne({
        where: { barcode, isActive: true }
    });
};

Product.searchProducts = async function(searchTerm) {
    const { Op } = require('sequelize');
    return await Product.findAll({
        where: {
            isActive: true,
            [Op.or]: [
                { name: { [Op.like]: `%${searchTerm}%` } },
                { barcode: { [Op.like]: `%${searchTerm}%` } },
                { description: { [Op.like]: `%${searchTerm}%` } },
                { location: { [Op.like]: `%${searchTerm}%` } },
                { borrowedBy: { [Op.like]: `%${searchTerm}%` } }
            ]
        },
        order: [['name', 'ASC']]
    });
};

Product.getBorrowedProducts = async function() {
    return await Product.findAll({
        where: { 
            status: 'borrowed', 
            isActive: true 
        },
        order: [['borrowedDate', 'DESC']]
    });
};

Product.getInStockProducts = async function() {
    return await Product.findAll({
        where: { 
            status: 'in_stock', 
            isActive: true 
        },
        order: [['name', 'ASC']]
    });
};

Product.getLocationCategories = async function() {
    const { Op } = require('sequelize');
    const locations = await Product.findAll({
        attributes: ['location'],
        where: {
            location: { [Op.ne]: null },
            isActive: true
        },
        group: ['location'],
        raw: true
    });
    return locations.map(item => item.location).filter(Boolean);
};

module.exports = Product; 