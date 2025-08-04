// controllers/post.controller.js
const Post = require('../models/post.model');
const Following = require('../models/following.model');
const { User } = require('../models/user.model');
const Notification = require('../models/notification.model'); // 1. Import at the top
const SavedPost = require('../models/savedPost.model'); // Import the new model


// @desc    Create a new post
// @route   POST /api/posts
const createPost = async (req, res, next) => {
    const { caption, tags } = req.body;

    try {
        if (!req.file) {
            res.status(400);
            throw new Error('Media file is required');
        }

        const mediaUrl = `http://localhost:5000/uploads/${req.file.filename}`;

        const post = await Post.create({
            user: req.user.id,
            caption,
            mediaUrl,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        });

        res.status(201).json(post);
    } catch (error) {
        next(error);
    }
};

// @desc    Get home feed posts from users the current user follows
// @route   GET /api/posts/feed
const getFeedPosts = async (req, res, next) => {
    try {
        // 1. Get page number and limit from query params, with default values
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const following = await Following.find({ userId: req.user.id });
        const followingIds = following.map(f => f.followingId);
        const feedUserIds = [req.user.id, ...followingIds];

        // 2. Get the total number of posts to calculate total pages
        const totalPosts = await Post.countDocuments({ user: { $in: feedUserIds } });

        // 3. Modify the query to use .skip() and .limit() for pagination
        const posts = await Post.find({ user: { $in: feedUserIds } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username dp');

        const saved = await SavedPost.find({ user: req.user.id });
        const savedPostIds = saved.map(item => item.post.toString());
        
        // 4. Send back the posts and pagination info
        res.status(200).json({
            success: true,
            posts: posts,
            user: req.user,
            savedPostIds: savedPostIds,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalPosts / limit),
                hasNextPage: page * limit < totalPosts
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Like or unlike a post
// @route   POST /api/posts/:postId/like
const likeUnlikePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.postId);
        // ... find post logic ...

        if (post.likes.includes(req.user.id)) {
            // Unliking, so we don't create a notification
            post.likes = post.likes.filter(/* ... */);
        } else {
            // 2. Liking, so create a notification
            post.likes.push(req.user.id);
            // Don't notify if a user likes their own post
            if (post.user.toString() !== req.user.id.toString()) {
                await Notification.create({
                    recipient: post.user,
                    sender: req.user.id,
                    type: 'like',
                    post: post._id,
                });
            }
        }
        await post.save();
        res.status(200).json(post.likes);
    } catch (error) {
        next(error);
    }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:postId/comments
const addCommentToPost = async (req, res, next) => {
    const { text } = req.body;
    try {
        if (!text) {
            res.status(400);
            throw new Error('Comment text is required');
        }

        const post = await Post.findById(req.params.postId);
        if (!post) {
            res.status(404);
            throw new Error('Post not found');
        }

        const comment = {
            user: req.user.id,
            text: text,
        };

        post.comments.push(comment);
        await post.save();
        
        // Populate the new comment with user info before sending back
        const newComment = post.comments[post.comments.length - 1];
        await Post.populate(newComment, { path: 'user', select: 'username dp' });

        res.status(201).json(newComment);

    } catch (error) {
        next(error);
    }
};

// @desc    Get all comments for a post
// @route   GET /api/posts/:postId/comments
const getPostComments = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.postId)
            .populate('comments.user', 'username dp');

        if (!post) {
            res.status(404);
            throw new Error('Post not found');
        }
        
        res.status(200).json(post.comments);

    } catch (error) {
        next(error);
    }
};

const getPostById = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user', 'username dp') // Populate the post's author details
            .populate('comments.user', 'username dp'); // Populate the details for each user who commented

        if (!post) {
            res.status(404);
            throw new Error('Post not found');
        }

        res.status(200).json({ success: true, post });
    } catch (error) {
        next(error);
    }
};

const savePost = async (req, res, next) => {
    try {
        const existingSave = await SavedPost.findOne({ user: req.user.id, post: req.params.id });
        if (existingSave) {
            res.status(400);
            throw new Error('Post already saved');
        }
        const savedPost = await SavedPost.create({
            user: req.user.id,
            post: req.params.id,
        });
        res.status(201).json(savedPost);
    } catch (error) {
        next(error);
    }
};

const unsavePost = async (req, res, next) => {
    try {
        const result = await SavedPost.findOneAndDelete({ user: req.user.id, post: req.params.id });
        if (!result) {
            res.status(404);
            throw new Error('Saved post not found');
        }
        res.status(200).json({ success: true, message: 'Post unsaved' });
    } catch (error) {
        next(error);
    }
};

module.exports = { createPost, getFeedPosts, savePost, unsavePost, getPostById, likeUnlikePost, addCommentToPost, getPostComments };