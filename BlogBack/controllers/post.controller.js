// controllers/post.controller.js
const Following = require('../models/following.model');
const { User } = require('../models/user.model');
const Notification = require('../models/notification.model'); // 1. Import at the top
const SavedPost = require('../models/savedPost.model'); // Import the new model
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const Post = require('../models/post.model'); 

// @desc    Create a new post
// @route   POST /api/posts
// Filename: controllers/post.controller.js


// ... (your other controller functions) ...

// REPLACE your old createPost function with THIS ONE:
const createPost = async (req, res, next) => {
  // Check if a file was uploaded by multer
  if (!req.file) {
    // It's better to return a JSON response for API errors
    return res.status(400).json({ message: "Please upload a media file." });
  }

  try {
    // 1. Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'gymrats_posts',
      resource_type: 'auto'
    });

    // 2. Delete the temporary file from your server
    fs.unlinkSync(req.file.path);

    // 3. Get data from the request and Cloudinary
    const { caption, privacy, tags } = req.body;
    const mediaUrl = result.secure_url;
    const mediaPublicId = result.public_id;

    // 4. Create the new post in your database
    const newPost = new Post({
      caption,
      privacy, // You'll need to add this to your Post model if it's not there
      tags: tags ? JSON.parse(tags) : [], // From your frontend, you stringify the tags
      mediaUrl: mediaUrl,
      mediaPublicId: mediaPublicId,
      user: req.user.id // Your old code used 'user', so I've kept that.
    });

    await newPost.save();

    // 5. Send the successful post back to the frontend
    res.status(201).json(newPost);

  } catch (error) {
    // If an error occurs, pass it to your central error handler
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
    console.log('like button triggered');
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const userId = req.user.id;

        if (post.likes.includes(userId)) {
            // Unliking
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        } else {
            // Liking
            post.likes.push(userId);

            if (post.user.toString() !== userId.toString()) {
                await Notification.create({
                    recipient: post.user,
                    sender: userId,
                    type: 'like',
                    post: post._id,
                });
            }
        }

        await post.save();
        res.status(200).json({ likes: post.likes });

    } catch (error) {
        console.error('Like/unlike error:', error); // Log for debugging
        next(error);
    }
};



// @desc    Get all comments for a post
// @route   GET /api/posts/:postId/comments
const getPostComments = async (req, res, next) => {
    try {
        console.log('--- Backend: getPostComments Triggered ---');
        const postId = req.params.postId;
        console.log('Backend received request for postId:', postId);

        // Check if the ID format is valid before querying
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            console.log('Error: The Post ID format is invalid.');
            return res.status(400).json({ success: false, message: 'Invalid Post ID format' });
        }

        console.log('Querying database for post...');
        const post = await Post.findById(postId);

        // This is the most important log. Check if 'post' is null or an object.
        console.log('Database query result:', post);

        if (!post) {
            console.log('Conclusion: Post NOT found in the database.');
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        
        // If the post is found, populate and send comments
        await post.populate('comments.user', 'username dp');
        console.log('Conclusion: Post found. Sending comments.');
        res.status(200).json({ success: true, comments: post.comments });

    } catch (error) {
        console.error("--- Backend Error in getPostComments ---:", error);
        next(error);
    }
};


// @desc    Add a comment to a post
// @route   POST /api/posts/:postId/comments
const addCommentToPost = async (req, res, next) => {
    try {
        console.log('--- Backend: addCommentToPost Triggered ---');
        const { text } = req.body;
        const postId = req.params.postId;
        console.log('Backend received request for postId:', postId);
        console.log('Comment Text:', text);
        // Also log the user attached by your auth middleware to ensure it's working
        console.log('User from token:', req.user);

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            console.log('Error: The Post ID format is invalid.');
            return res.status(400).json({ success: false, message: 'Invalid Post ID format' });
        }

        const post = await Post.findById(postId);
        console.log('Database query result:', post);

        if (!post) {
            console.log('Conclusion: Post NOT found. Cannot add comment.');
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const comment = {
            user: req.user.id,
            text: text,
        };

        post.comments.push(comment);
        await post.save();

        const newComment = post.comments[post.comments.length - 1];
        await Post.populate(newComment, { path: 'user', select: 'username dp' });
        
        console.log('Conclusion: Comment added successfully.');
        res.status(201).json({ success: true, comment: newComment });

    } catch (error) {
        console.error("--- Backend Error in addCommentToPost ---:", error);
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