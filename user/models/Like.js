// models/Like.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Like = sequelize.define('Like', {
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
  trackId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Spotify track ID',
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'], name: 'like_user_id_idx' },
  ],
});

module.exports = Like;
