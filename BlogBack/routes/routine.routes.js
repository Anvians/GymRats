const express = require('express');
const router = express.Router();
const { getAllRoutines, getRoutineById } = require('../controllers/routine.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// We protect these routes to ensure only logged-in users can see them.
router.route('/').get(authenticateToken, getAllRoutines);
router.route('/:id').get(authenticateToken, getRoutineById);

module.exports = router;