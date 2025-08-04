// controllers/auth.controller.js
const { User } = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

require('dotenv').config();

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username }, // Now this works correctly
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};



// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res, next) => {
  // 1. Check for validation errors first
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstname, lastname, username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      res.status(400);
      throw new Error('User with this email or username already exists');
    }

    // Create the user
    const user = await User.create({ firstname, lastname, username, email, password });

    if (user) {
      // 2. Respond with user info and the CORRECTLY generated token
      res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        token: generateToken(user), // THE FIX: Pass the whole user object
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error); // Pass errors to the central error handler
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const loginUser = async (req, res, next) => {
  // 1. Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        dp: user.dp,
        // 2. THE FIX: Pass the entire `user` object to generate a valid token
        token: generateToken(user),
      });
    } else {
      // Use a generic error message for security
      res.status(401);
      throw new Error('Invalid username or password');
    }
  } catch (error) {
    next(error);
  }
};
// @desc    Get current logged-in user data
// @route   GET /api/auth/me
const getMe = (req, res, next) => {
    // The `authenticateToken` middleware has already verified the token
    // and attached the user object to `req.user`. If it failed, this controller wouldn't be reached.
    res.status(200).json(req.user);
};


module.exports = { registerUser, loginUser, getMe };