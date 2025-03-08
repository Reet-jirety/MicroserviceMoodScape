// user.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const User = sequelize.define('User', {
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'full_name', // maps to column 'full_name' in the DB
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'image_url', // maps to column 'image_url' in the DB
  },
  clerkId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'clerk_id', // maps to column 'clerk_id' in the DB
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt columns automatically
  tableName: 'users', // Explicit table name in PostgreSQL
});

module.exports = User;
