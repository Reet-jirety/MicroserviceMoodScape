// models/index.js
const History = require('./History');
const Playlist = require('./Playlist');
const Like = require('./Like');
const PlaylistTrack = require('./PlaylistTrack');

const syncModels = async () => {
  try {
    // Use alter:true for development; consider migrations for production
    await History.sync({ alter: true });
    await Playlist.sync({ alter: true });
    await Like.sync({ alter: true });
    await PlaylistTrack.sync({ alter: true });
    console.log('All models synced successfully.');
  } catch (error) {
    console.error('Error syncing models:', error);
    throw error;
  }
};

module.exports = { syncModels };
