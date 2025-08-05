// routes/post.routes.js
const express = require('express');
const router = express.Router();
const {
  createPost,
  getFeedPosts,
  likeUnlikePost,
  addCommentToPost,
  getPostComments,
  savePost,
  unsavePost,
  getPostById, // 1. Import the new function

} = require('../controllers/post.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const multer = require('multer'); // <-- Import multer

// Configure multer here
const upload = multer({ dest: 'uploads/' });

// Note: Using router.route() can group handlers for the same path
router.route('/')
  .post(authenticateToken, upload.single('media'), createPost); // Use 'media' as the field name

router.get('/feed', authenticateToken, getFeedPosts);
router.route('/:id').get(authenticateToken, getPostById);

router.route('/:postId/like')
  .post(authenticateToken, likeUnlikePost); // Handles both liking and unliking

router.route('/:postId/comments')
    .post(authenticateToken, addCommentToPost)
    .get(authenticateToken, getPostComments);
router.route('/:id/save')
  .post(authenticateToken, savePost)
  .delete(authenticateToken, unsavePost);

module.exports = router;