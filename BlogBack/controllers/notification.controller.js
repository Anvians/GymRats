const Notification = require('../models/notification.model');

// @desc    Get all notifications for the logged-in user
// @route   GET /api/notifications
const getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .populate('sender', 'username dp') // Get sender's details
            .populate('post', 'mediaUrl'); // Get post thumbnail
        
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark notifications as read
// @route   POST /api/notifications/read
const markNotificationsAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, read: false },
            { $set: { read: true } }
        );
        res.status(200).json({ success: true, message: 'Notifications marked as read.' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getNotifications, markNotificationsAsRead };