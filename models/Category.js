const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  discount_percent: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.0,
  },
}, {
  tableName: 'categories',
  freezeTableName: true,
  timestamps: false,
});

module.exports = Category;
