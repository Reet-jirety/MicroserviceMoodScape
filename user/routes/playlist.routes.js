const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlist.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Playlist routes
router.post('/', playlistController.createPlaylist);
router.get('/', playlistController.getUserPlaylists);
router.get('/public', playlistController.getPublicPlaylists);
router.get('/mood/:mood', playlistController.getPlaylistsByMood);
router.get('/:id', playlistController.getPlaylistById);
router.put('/:id', playlistController.updatePlaylist);
router.delete('/:id', playlistController.deletePlaylist);

// Playlist tracks routes
router.post('/:id/tracks', playlistController.addTrackToPlaylist);
router.delete('/:id/tracks/:trackId', playlistController.removeTrackFromPlaylist);
router.put('/:id/tracks/reorder', playlistController.reorderPlaylistTracks);

module.exports = router;