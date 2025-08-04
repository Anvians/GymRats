const mongoose = require('mongoose');

// NEW: A sub-schema for a single completed set
const completedSetSchema = new mongoose.Schema({
    weight: { type: Number, default: 0 },
    reps: { type: Number, default: 0 },
}, {_id: false});

// NEW: A sub-schema for a completed exercise
const completedExerciseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sets: [completedSetSchema],
}, {_id: false});

const workoutSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    // The name of the routine, e.g., 'Full Body Strength'
    workoutTitle: {
        type: String,
        required: true,
        trim: true,
    },
    // Duration in minutes
    durationMinutes: {
        type: Number,
        required: true,
    },
    // A structured log of the exercises and sets performed
    exercises: [completedExerciseSchema],
    // Any personal records achieved during this workout
    personalRecords: [{
        exercise: { type: String, trim: true },
        value: { type: String, trim: true },
    }],
    date: {
        type: Date,
        default: Date.now,
        required: true,
    },
}, { timestamps: true });

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;