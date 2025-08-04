// models/post.model.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  caption: { type: String, trim: true, default: '' },
  mediaUrl: { type: String, required: true },
  tags: [{ type: String, lowercase: true, trim: true }],
  privacy: { type: String, enum: ['public', 'friends', 'only_me'], default: 'public' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema], // Embed comments
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;