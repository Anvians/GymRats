const express = require('express');
const router = express.Router();
const { getStories, createStory } = require('../controllers/story.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.route('/').get(authenticateToken, getStories);
router.route('/').post(authenticateToken, createStory); // For uploading a new story

module.exports = router;