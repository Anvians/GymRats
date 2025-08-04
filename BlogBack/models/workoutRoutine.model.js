// models/workoutRoutine.model.js

const mongoose = require('mongoose');

const workoutRoutineSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true }, 
    desc: { type: String, trim: true }, 
    type: { type: String, required: true, index: true }, 
    bodyPart: { type: String, required: true, index: true },
    equipment: { type: String, required: true },
    level: { type: String, required: true, index: true },
    rating: { type: Number, default: 0 },
    exercises: [{
        name: { type: String, required: true },
        targetSets: { type: Number },
        targetReps: { type: String },
    }], 
}, { timestamps: true });

const WorkoutRoutine = mongoose.model('WorkoutRoutine', workoutRoutineSchema);

module.exports = WorkoutRoutine;