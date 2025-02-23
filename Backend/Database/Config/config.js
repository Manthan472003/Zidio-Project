require('dotenv').config(); // Ensure dotenv is loaded to access environment variables

const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2');  // Explicitly require mysql2 package

// Use environment variables
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',  // Use 'mysql' explicitly, Sequelize will use 'mysql2' when installed
  port: process.env.DB_PORT || 3306,
  logging: false, // Optional: you can disable logging for production
  dialectModule: mysql2,  // Ensure Sequelize uses the correct MySQL driver (mysql2)
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false,
    } : undefined,  // Conditionally add SSL options based on environment variable
  },
});

module.exports = sequelize;
