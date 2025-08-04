const WorkoutRoutine = require('../models/workoutRoutine.model');

// @desc    Get all available workout routines
// @route   GET /api/routines
const getAllRoutines = async (req, res, next) => {
    try {
        // PREVIOUSLY: const routines = await WorkoutRoutine.find({}).select('name description category');
        
        // THE FIX: Remove .select() to get all fields
        const routines = await WorkoutRoutine.find({}); 
        
        res.status(200).json({ success: true, routines });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single workout routine by its ID
// @route   GET /api/routines/:id
const getRoutineById = async (req, res, next) => {
    try {
        const routine = await WorkoutRoutine.findById(req.params.id);
        if (!routine) {
            res.status(404);
            throw new Error('Workout routine not found');
        }
        res.status(200).json({ success: true, routine });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllRoutines,
    getRoutineById,
};