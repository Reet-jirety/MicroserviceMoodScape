const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Playlist = sequelize.define('Playlist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'References the user ID from auth service'
  },
  coverImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  mood: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Associated mood for this playlist (happy, sad, etc.)'
  }
}, {
  timestamps: true
});

module.exports = Playlist;