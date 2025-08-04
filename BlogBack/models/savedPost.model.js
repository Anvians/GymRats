const mongoose = require('mongoose');

const savedPostSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    post: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post', 
        required: true 
    },
}, { timestamps: true });

// Prevent a user from saving the same post twice
savedPostSchema.index({ user: 1, post: 1 }, { unique: true });

const SavedPost = mongoose.model('SavedPost', savedPostSchema);

module.exports = SavedPost;