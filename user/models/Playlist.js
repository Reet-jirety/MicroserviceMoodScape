// models/Playlist.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Playlist = sequelize.define('Playlist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'User ID from auth service',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = Playlist;
