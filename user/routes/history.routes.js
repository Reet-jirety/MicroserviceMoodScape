const express = require('express');
const router = express.Router();
const historyController = require('../controllers/history.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// History routes
router.post('/', historyController.addToHistory);
router.get('/', historyController.getUserHistory);
router.delete('/', historyController.clearHistory);
router.get('/most-played', historyController.getMostPlayed);

module.exports = router;