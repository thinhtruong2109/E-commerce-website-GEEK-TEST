const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const OrderFeesDiscount = sequelize.define('OrderFeesDiscount', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(20), // 'fee' hoặc 'discount'
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
}, {
  tableName: 'order_fees_discounts',
  freezeTableName: true,
  timestamps: false,
});

module.exports = OrderFeesDiscount;
