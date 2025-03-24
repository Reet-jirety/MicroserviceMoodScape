const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Playlist = require('./Playlist');

const PlaylistTrack = sequelize.define('PlaylistTrack', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  playlistId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Playlist,
      key: 'id'
    }
  },
  trackId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Spotify track ID'
  },
  trackName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  artistName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  albumName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  albumCover: {
    type: DataTypes.STRING,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in milliseconds'
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Position of the track in the playlist'
  },
  addedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true
});

// Define the association
Playlist.hasMany(PlaylistTrack, { foreignKey: 'playlistId', onDelete: 'CASCADE' });
PlaylistTrack.belongsTo(Playlist, { foreignKey: 'playlistId' });

module.exports = PlaylistTrack;