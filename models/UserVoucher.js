const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const UserVoucher = sequelize.define('UserVoucher', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  voucher_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'user_vouchers',
  freezeTableName: true,
  timestamps: false,
});

module.exports = UserVoucher;
