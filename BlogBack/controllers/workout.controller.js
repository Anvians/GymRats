const Workout = require('../models/workout.model');
const WorkoutRoutine = require('../models/workoutRoutine.model');

// @desc    Save a completed workout session
// @route   POST /api/workouts/complete
const saveCompletedWorkout = async (req, res, next) => {
    try {
        const { routineId, durationMinutes, log } = req.body;

        // 1. Validate the incoming data
        if (!routineId || !durationMinutes || !log || !Array.isArray(log)) {
            res.status(400);
            throw new Error('Missing or invalid workout data.');
        }

        // 2. Find the original routine to get its title
        const routine = await WorkoutRoutine.findById(routineId);
        if (!routine) {
            res.status(404);
            throw new Error('Workout routine not found.');
        }

        // 3. Format the log data to match our new schema
        const completedExercises = log.map(exerciseLog => {
            const completedSets = exerciseLog.sets
                .filter(set => set.isComplete) // Only include sets marked as complete
                .map(set => ({
                    weight: Number(set.weight) || 0,
                    reps: Number(set.reps) || 0,
                }));
            
            return {
                name: exerciseLog.exerciseName,
                sets: completedSets,
            };
        });

        // 4. Create the new workout document
        const newWorkout = await Workout.create({
            userId: req.user.id,
            workoutTitle: routine.title,
            durationMinutes: durationMinutes,
            exercises: completedExercises,
            // We can add PR detection logic here later
        });

        res.status(201).json({ 
            success: true, 
            message: "Workout saved successfully!", 
            workout: newWorkout 
        });

    } catch (error) {
        next(error);
    }
};

const getChartData = async (req, res, next) => {
    try {
        // Get the specific exercise to track from a query param, e.g., ?exercise=Bench%20Press
        const { exercise } = req.query;
        if (!exercise) {
            res.status(400);
            throw new Error('Exercise query parameter is required.');
        }

        // Find all workouts for the user that contain the specified exercise
        const workouts = await Workout.find({ 
            userId: req.user.id,
            'exercises.name': exercise
        }).sort({ date: 'asc' }); // Sort by date ascending

        const labels = []; // For the X-axis (Dates)
        const data = [];   // For the Y-axis (Max Weight)

        // Process the data
        workouts.forEach(workout => {
            workout.exercises.forEach(ex => {
                if (ex.name === exercise && ex.sets.length > 0) {
                    // Find the max weight lifted in this session for this exercise
                    const maxWeight = Math.max(...ex.sets.map(set => set.weight));

                    // Format the date for the chart label
                    const formattedDate = new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    
                    labels.push(formattedDate);
                    data.push(maxWeight);
                }
            });
        });

        res.status(200).json({ success: true, labels, data });

    } catch (error) {
        next(error);
    }
};

const getHeatmapData = async (req, res, next) => {
    try {
        // Get all workouts for the user from the last year
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const workouts = await Workout.find({ 
            userId: req.user.id,
            date: { $gte: oneYearAgo }
        }).select('date');

        // Process the data into a format the heatmap understands: { date: 'YYYY-MM-DD', count: N }
        const countsByDate = workouts.reduce((acc, workout) => {
            const date = workout.date.toISOString().split('T')[0]; // Format to YYYY-MM-DD
            acc[date] = (acc[date] || 0) + 1; // Increment count for that day
            return acc;
        }, {});

        const heatmapData = Object.keys(countsByDate).map(date => ({
            date: date,
            count: countsByDate[date],
        }));
        
        res.status(200).json({ success: true, heatmapData });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    saveCompletedWorkout,
    getChartData,
    getHeatmapData

};