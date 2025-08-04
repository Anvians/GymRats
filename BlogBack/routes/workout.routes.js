const express = require('express');
const router = express.Router();
const { saveCompletedWorkout, getChartData, getHeatmapData   } = require('../controllers/workout.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
 
// Route to save a new completed workout session
router.route('/complete').post(authenticateToken, saveCompletedWorkout);
// Route to get data for charts
router.route('/chart-data').get(authenticateToken, getChartData);

router.route('/heatmap-data').get(authenticateToken, getHeatmapData);

module.exports = router;