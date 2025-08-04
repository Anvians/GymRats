const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // The user who receives the notification
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // The user who triggered the notification
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // The type of notification
    type: {
        type: String,
        enum: ['like', 'comment', 'follow'],
        required: true,
    },
    // Optional: reference to the post that was liked or commented on
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    // To track if the user has seen the notification
    read: { type: Boolean, default: false, index: true },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;