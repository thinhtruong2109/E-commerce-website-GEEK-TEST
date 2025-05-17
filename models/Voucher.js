const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const Voucher = sequelize.define('Voucher', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  discount_percent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  valid_from: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  valid_to: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'vouchers',
  freezeTableName: true,
  timestamps: false,
});

module.exports = Voucher;
