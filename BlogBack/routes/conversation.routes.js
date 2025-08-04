const express = require('express');
const router = express.Router();
const { getConversations, getMessages,findOrCreateConversation } = require('../controllers/conversation.controller');
const { authenticateToken } = require('../middleware/auth.middleware');


router.route('/').get(authenticateToken, getConversations);
router.route('/:id/messages').get(authenticateToken, getMessages);
router.route('/findOrCreate').post(authenticateToken, findOrCreateConversation);

module.exports = router;