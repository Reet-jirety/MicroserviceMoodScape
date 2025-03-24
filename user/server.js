// server.js
const express = require('express');
const cors = require('cors');
const { connectToDatabase } = require('./config/database');
const { syncModels } = require('./models');
const playlistRoutes = require('./routes/playlist.routes');
const likeRoutes = require('./routes/like.routes');
const historyRoutes = require('./routes/history.routes');

require('dotenv').config();

// Log environment variables for debugging
console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);
console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
console.log('POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD);
console.log('POSTGRES_DB:', process.env.POSTGRES_DB);

const app = express();
const PORT = process.env.PORT || 8050;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'playlist-service' });
});

// Routes
app.use('/user/api/playlists', playlistRoutes);
app.use('/user/api/likes', likeRoutes);
app.use('/user/api/history', historyRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : `Error: ${err.message}`
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
async function startServer() {
  try {
    await connectToDatabase();
    await syncModels(); // Ensure models are created or updated
    app.listen(PORT, () => {
      console.log(`Playlist service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
