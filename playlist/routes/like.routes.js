const express = require('express');
const router = express.Router();
const likeController = require('../controllers/like.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Like routes
router.post('/', likeController.addLike);
router.delete('/:trackId', likeController.removeLike);
router.get('/', likeController.getUserLikes);
router.get('/status/:trackId', likeController.checkLikeStatus);

module.exports = router;