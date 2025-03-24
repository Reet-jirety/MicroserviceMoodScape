const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  logging: process.env.NODE_ENV !== 'production',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync models with database
    await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
    console.log('Database models synchronized.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectToDatabase
};