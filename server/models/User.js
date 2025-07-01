const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
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
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            notEmpty: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [6, 255]
        }
    },
    role: {
        type: DataTypes.ENUM('admin', 'user'),
        defaultValue: 'user',
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    }
}, {
    tableName: 'users',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['email']
        }
    ],
    hooks: {
        // Şifreyi kaydetmeden önce hash'le
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, parseInt(process.env.BCRYPT_ROUNDS));
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, parseInt(process.env.BCRYPT_ROUNDS));
            }
        }
    }
});

// Instance metodları
User.prototype.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
};

// Class metodları
User.findByEmail = async function(email) {
    return await User.findOne({
        where: { email, isActive: true }
    });
};

User.createUser = async function(userData) {
    return await User.create(userData);
};

module.exports = User; 