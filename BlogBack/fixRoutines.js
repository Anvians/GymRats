const mongoose = require('mongoose');
require('dotenv').config();

// 1. Import your WorkoutRoutine model
const WorkoutRoutine = require('./models/workoutRoutine.model');

const fixRoutines = async () => {
    console.log('Connecting to the database...');
    // 2. Connect to your MongoDB database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected.');

    try {
        // 3. Find all routines where the 'exercises' array is empty or doesn't exist
        const routinesToFix = await WorkoutRoutine.find({
            $or: [{ exercises: { $size: 0 } }, { exercises: { $exists: false } }]
        });

        if (routinesToFix.length === 0) {
            console.log('No routines need fixing. All documents have exercises.');
            process.exit();
            return;
        }

        console.log(`Found ${routinesToFix.length} routines to fix...`);

        // 4. Create an array of update operations for a bulk write
        const operations = routinesToFix.map(routine => {
            // For each routine, we'll create one default exercise using its title
            const defaultExercise = {
                name: routine.title,
                targetSets: 3,       // A sensible default
                targetReps: '10-15'  // A sensible default
            };

            return {
                updateOne: {
                    filter: { _id: routine._id },
                    update: { $set: { exercises: [defaultExercise] } }
                }
            };
        });

        // 5. Execute all updates in a single, efficient database command
        const result = await WorkoutRoutine.bulkWrite(operations);
        console.log('Bulk update complete!');
        console.log(`${result.modifiedCount} routines were successfully updated.`);

    } catch (error) {
        console.error('An error occurred while fixing the data:', error);
    } finally {
        // 6. Disconnect from the database and exit the script
        await mongoose.disconnect();
        console.log('Database disconnected.');
        process.exit();
    }
};

// Run the function
fixRoutines();