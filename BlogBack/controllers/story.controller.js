const Story = require('../models/story.model');
const { User } = require('../models/user.model'); // Assuming user model is here

// @desc    Get all active stories for the story bar
const getStories = async (req, res, next) => {
    try {
        // Find all users who have active (non-expired) stories
        const usersWithStories = await Story.distinct('user', { 
            expiresAt: { $gt: new Date() } 
        });

        // Get user details for the story bar
        const stories = await User.find({
            '_id': { $in: usersWithStories }
        }).select('username dp');

        // This is a simplified version. You can add a `hasUnseenStory` flag
        // by checking if the req.user.id is in the `viewers` array of any story
        // for each user, but this is a great start.
        
        res.status(200).json({ success: true, stories });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new story (you would use multer here for file uploads)
const createStory = async (req, res, next) => {
    try {
        // In a real app, `mediaUrl` would come from a file upload middleware like multer
        const { mediaUrl, mediaType } = req.body;

        if (!mediaUrl) {
            res.status(400);
            throw new Error('Media URL is required to create a story.');
        }

        const story = await Story.create({
            user: req.user.id,
            mediaUrl,
            mediaType
        });

        res.status(201).json({ success: true, story });

    } catch (error) {
        next(error);
    }
};

module.exports = { getStories, createStory };