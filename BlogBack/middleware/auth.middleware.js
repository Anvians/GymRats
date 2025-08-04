const jwt = require('jsonwebtoken');
const { User } = require('../models/user.model');
require('dotenv').config();

const authenticateToken = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      // 1. Extract token from header
      token = authHeader.split(' ')[1];

      // 2. Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Find the user in the database and attach to the request object
      req.user = await User.findById(decoded.id).select('-password');

      // 4. Check if user exists
      if (!req.user) {
        // This case is important if a token is valid but the user has been deleted.
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      // 5. Proceed to the next middleware/controller
      next();
    } catch (error) {
      // This will catch errors from jwt.verify (e.g., expired token, invalid signature)
      return res.status(401).json({ success: false, message: 'Not authorized, token is invalid or expired' });
    }
  } else {
    // If no 'Bearer' header is found, immediately send an error
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { authenticateToken };