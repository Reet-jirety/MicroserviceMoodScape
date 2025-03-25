const { History } = require('../models');
const { sequelize } = require('../config/database');

// Add a track to user's history
exports.addToHistory = async (req, res) => {
  console.log(req.userId);
  
  const { trackId, trackName, artistName, albumName, albumCover, playDuration } = req.body;
  const userId = req.userId; // Assuming middleware sets this

  if (!trackId || !trackName || !artistName) {
    return res.status(400).json({ message: 'Track ID, name, and artist are required' });
  }

  try {
    // Create history entry
    const historyEntry = await History.create({
      userId,
      trackId,
      trackName,
      artistName,
      albumName,
      albumCover,
      playDuration
    });

    res.status(201).json({
      message: 'Track added to history',
      historyEntry
    });
  } catch (error) {
    console.error('Error adding to history:', error);
    res.status(500).json({ message: 'Failed to add to history' });
  }
};

// Get user's listening history
exports.getUserHistory = async (req, res) => {
  const userId = req.userId; // Assuming middleware sets this
  const { limit = 50, offset = 0 } = req.query;

  try {
    const history = await History.findAll({
      where: { userId },
      order: [['playedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({ history });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Failed to fetch history' });
  }
};

// Clear user's history
exports.clearHistory = async (req, res) => {
  const userId = req.userId; // Assuming middleware sets this

  try {
    await History.destroy({
      where: { userId }
    });

    res.status(200).json({ message: 'History cleared successfully' });
  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({ message: 'Failed to clear history' });
  }
};

// Get user's most played tracks
exports.getMostPlayed = async (req, res) => {
  const userId = req.userId; // Assuming middleware sets this
  const { limit = 10 } = req.query;

  try {
    const mostPlayed = await History.findAll({
      where: { userId },
      attributes: [
        'trackId',
        'trackName',
        'artistName',
        'albumName',
        'albumCover',
        [sequelize.fn('COUNT', sequelize.col('trackId')), 'playCount']
      ],
      group: ['trackId', 'trackName', 'artistName', 'albumName', 'albumCover'],
      order: [[sequelize.fn('COUNT', sequelize.col('trackId')), 'DESC']],
      limit: parseInt(limit)
    });

    res.status(200).json({ mostPlayed });
  } catch (error) {
    console.error('Error fetching most played tracks:', error);
    res.status(500).json({ message: 'Failed to fetch most played tracks' });
  }
};