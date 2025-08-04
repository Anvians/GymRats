// routes/auth.routes.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator'); // 1. Import the validator

// Import your controllers and middleware
const { registerUser, loginUser, getMe } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// 2. Add validation rules to the '/register' route
router.post('/register', [
    body('firstname', 'First name is required').not().isEmpty(),
    body('username', 'Username must be at least 3 characters').isLength({ min: 3 }),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], registerUser);

// 3. Add validation rules to the '/login' route
router.post('/login', [
    body('username', 'Username cannot be empty').not().isEmpty(),
    body('password', 'Password cannot be empty').not().isEmpty()
], loginUser);

// This route for getting the current user is correct
router.get('/me', authenticateToken, getMe);

module.exports = router;