const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationsAsRead } = require('../controllers/notification.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.route('/').get(authenticateToken, getNotifications);
router.route('/read').post(authenticateToken, markNotificationsAsRead);

module.exports = router;