// models/User.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  province: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  commune: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  address_detail: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  housing_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'users', 
  timestamps: false,
  freezeTableName: true,
});

module.exports = User;
