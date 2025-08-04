// routes/user.routes.js
const express = require('express');
const router = express.Router();

const {
  getProfileByUsername,
  getMyProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getDashboardData,
  searchUsers,
  updateUserProfile,
  getSavedPosts, // Import the new function
} = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Quick check for undefined controllers (optional, for debugging)
if (
  !getProfileByUsername ||
  !followUser ||
  !unfollowUser ||
  !getMyProfile ||
  !getFollowers ||
  !getFollowing ||
  !searchUsers ||
  !updateUserProfile
) {
  throw new Error("One or more controller functions are undefined in user.controller.js");
}


router.get('/profile/me', authenticateToken, getMyProfile);

// Public route to get a user's profile
router.get('/profile/:username', authenticateToken, getProfileByUsername);

// Protected routes
router.get('/dashboard', authenticateToken, getDashboardData);
router.post('/follow', authenticateToken, followUser);
router.post('/unfollow', authenticateToken, unfollowUser);
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);
router.get('/search', authenticateToken, searchUsers);
router.put('/profile/edit', authenticateToken, upload.single('dp'), updateUserProfile);
router.get('/me/saved', authenticateToken, getSavedPosts);

module.exports = router;