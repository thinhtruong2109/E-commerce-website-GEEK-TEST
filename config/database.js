require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,     
  process.env.DATABASE_USER,     
  process.env.DATABASE_PASSWORD, 
  {
    host: process.env.DATABASE_HOST || 'localhost',
    dialect: 'postgres',
    logging: false,
    port: process.env.DATABASE_PORT || 5432
  }
);

module.exports = {
    sequelize,
    connect: async () => {
    try {
      await sequelize.authenticate();
      console.log('Connection to the database has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  }
}
