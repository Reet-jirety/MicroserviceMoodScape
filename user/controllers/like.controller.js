const { Like } = require('../models');

// Add a track to user's likes
exports.addLike = async (req, res) => {
  const { trackId, trackName, artistName, albumName, albumCover } = req.body;
  const userId = req.userId; // Assuming middleware sets this

  if (!trackId || !trackName || !artistName) {
    return res.status(400).json({ message: 'Track ID, name, and artist are required' });
  }

  try {
    // Check if already liked
    const existingLike = await Like.findOne({
      where: { userId, trackId }
    });

    if (existingLike) {
      return res.status(200).json({ 
        message: 'Track already liked',
        like: existingLike
      });
    }

    // Create new like
    const like = await Like.create({
      userId,
      trackId,
      trackName,
      artistName,
      albumName,
      albumCover
    });

    res.status(201).json({
      message: 'Track added to likes',
      like
    });
  } catch (error) {
    console.error('Error adding like:', error);
    res.status(500).json({ message: 'Failed to add like' });
  }
};

// Remove a track from user's likes
exports.removeLike = async (req, res) => {
  const { trackId } = req.params;
  const userId = req.userId; // Assuming middleware sets this

  try {
    const like = await Like.findOne({
      where: { userId, trackId }
    });

    if (!like) {
      return res.status(404).json({ message: 'Like not found' });
    }

    await like.destroy();

    res.status(200).json({ message: 'Like removed successfully' });
  } catch (error) {
    console.error('Error removing like:', error);
    res.status(500).json({ message: 'Failed to remove like' });
  }
};

// Get all likes for a user
exports.getUserLikes = async (req, res) => {
  const userId = req.userId; // Assuming middleware sets this

  try {
    const likes = await Like.findAll({
      where: { userId },
      order: [['likedAt', 'DESC']]
    });

    res.status(200).json({ likes });
  } catch (error) {
    console.error('Error fetching likes:', error);
    res.status(500).json({ message: 'Failed to fetch likes' });
  }
};

// Check if a track is liked by the user
exports.checkLikeStatus = async (req, res) => {
  const { trackId } = req.params;
  const userId = req.userId; // Assuming middleware sets this

  try {
    const like = await Like.findOne({
      where: { userId, trackId }
    });

    res.status(200).json({ isLiked: !!like });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ message: 'Failed to check like status' });
  }
};