// models/following.model.js
const mongoose = require('mongoose');

const followingSchema = new mongoose.Schema({
  // The user who is doing the following
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // The user who is being followed
  followingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
}, { timestamps: true });

// Create a unique compound index to prevent a user from following another user more than once
followingSchema.index({ userId: 1, followingId: 1 }, { unique: true });

const Following = mongoose.model('Following', followingSchema);

module.exports = Following;