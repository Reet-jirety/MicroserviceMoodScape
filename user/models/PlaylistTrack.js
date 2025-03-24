// models/PlaylistTrack.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PlaylistTrack = sequelize.define('PlaylistTrack', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  playlistId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Reference to Playlist',
  },
  trackId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Spotify track ID',
  },
}, {
  timestamps: true,
});

module.exports = PlaylistTrack;
