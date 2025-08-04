const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

// Load the model
const WorkoutRoutine = require('./models/workoutRoutine.model');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Read the JSON file
const routines = JSON.parse(
    fs.readFileSync(`${__dirname}/data/workouts.json`, 'utf-8')
);

// Function to import data into DB
const importData = async () => {
    try {
        // First, delete all existing routines to avoid duplicates
        await WorkoutRoutine.deleteMany();
        console.log('Data Destroyed...');

        // Then, insert the new routines from your JSON file
        await WorkoutRoutine.insertMany(routines);
        console.log('Data Imported...');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

// You can run this script with `node seeder -import`
if (process.argv[2] === '-import') {
    importData();
}