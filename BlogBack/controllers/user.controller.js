// controllers/user.controller.js
const Workout = require('../models/workout.model');
const Notification = require('../models/notification.model'); // 1. Import at the top
const SavedPost = require('../models/savedPost.model'); // Import the model

const { User, UserData } = require('../models/user.model');
const Post = require('../models/post.model');
const Following = require('../models/following.model');

// --- NEW AND IMPROVED getMyProfile ---
const getMyProfile = async (req, res, next) => {
    try {
        // req.user.id comes from your authentication middleware
        const userId = req.user.id; 
        
        // Use Promise.all to fetch everything at once for performance
        const [user, posts, followerCount, followingCount] = await Promise.all([
            User.findById(userId).select('-password').lean(),
            Post.find({ user: userId }).sort({ createdAt: -1 }).lean(),
            Following.countDocuments({ followingId: userId }),
            Following.countDocuments({ userId: userId })
        ]);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Combine all data into a single profile object, just like getProfileByUsername
        const profileData = {
            ...user,
            posts,
            postCount: posts.length,
            followerCount,
            followingCount,
        };

        res.status(200).json({ success: true, profile: profileData });

    } catch (error) {
        next(error);
    }
};


// Dashboard data controller
// This will fetch the user's dashboard data including recent workouts, PRs, etc.

const getDashboardData = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const [
            userData,
            recentWorkouts,
            allPrs,
            recentNotifications // Add this to Promise.all
        ] = await Promise.all([
            UserData.findOne({ userId }).lean(),
            Workout.find({ userId }).sort({ date: -1 }).limit(10).lean(),
            Workout.find({ userId, 'personalRecords.0': { $exists: true } }).sort({ date: -1 }).select('personalRecords date').lean(),
            Notification.find({ recipient: userId }).sort({ createdAt: -1 }).limit(5).populate('sender', 'username dp').lean() // Fetch last 5 notifications
        ]);

        // ... logic to process streak, lastWorkout, currentWeight ...

        const dashboardData = {
            username: req.user.username,
            streak,
            lastWorkout,
            currentWeight,
            recentWorkouts,
            personalRecords: allPrs.flatMap(w => w.personalRecords),
            recentNotifications // Add notifications to the response
        };
        
        res.status(200).json({ success: true, dashboard: dashboardData });

    } catch (error) {
        next(error);
    }
};


// 1. Get profile by username
// controllers/user.controller.js

const getProfileByUsername = async (req, res, next) => {
    try {
        const { username } = req.params;
        const loggedInUserId = req.user.id;

        const user = await User.findOne({ username }).select('-password').lean();
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Fetch everything in parallel for performance
        const [posts, followersDocs, followingDocs, isFollowingCheck] = await Promise.all([
            Post.find({ user: user._id }).sort({ createdAt: -1 }).lean(),
            
            // ✅ Fetch the list of documents where the user is being followed
            Following.find({ followingId: user._id }).populate({
                path: 'userId', // The person who is following
                select: 'username firstname lastname dp'
            }),

            // ✅ Fetch the list of documents where the user is following others
            Following.find({ userId: user._id }).populate({
                path: 'followingId', // The person being followed
                select: 'username firstname lastname dp'
            }),
            
            // Check if the logged-in user follows this profile
            Following.findOne({ userId: loggedInUserId, followingId: user._id })
        ]);

        // ✅ Extract just the user data from the populated documents
        const followers = followersDocs.map(doc => doc.userId);
        const following = followingDocs.map(doc => doc.followingId);

        // Assemble the complete profile data
        const profileData = {
            ...user,
            posts,
            postCount: posts.length,
            followers, // The full array of follower objects
            followerCount: followers.length,
            following, // The full array of following objects
            followingCount: following.length,
            isFollowedByMe: !!isFollowingCheck,
        };

        res.status(200).json({ success: true, profile: profileData });
    } catch (error) {
        next(error);
    }
};
// 2. Follow user
const followUser = async (req, res, next) => {
  try {
    const { followingId } = req.body;
    const userId = req.user.id;
    // ... validation logic ...
    
    await Following.create({ userId, followingId });

    // 2. Create a notification for the user who was followed
    if (userId !== followingId) { // Don't notify for self-follow
        await Notification.create({
            recipient: followingId,
            sender: userId,
            type: 'follow',
        });
    }

    res.status(200).json({ success: true, message: "Followed successfully." });
  } catch (error) {
    next(error);
  }
};
// 3. Unfollow user
const unfollowUser = async (req, res, next) => {
  try {
    const { followingId } = req.body;
    const userId = req.user.id;
    // TWEAK: Using findOneAndDelete gives us feedback if the relationship existed.
    const result = await Following.findOneAndDelete({ userId, followingId });
    if (!result) {
        return res.status(404).json({ success: false, message: "You were not following this user." });
    }
    res.status(200).json({ success: true, message: "Unfollowed successfully." });
  } catch (error) {
    next(error);
  }
};

// 4. Get followers
const getFollowers = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const relationships = await Following.find({ followingId: userId })
      .populate('userId', 'username firstname lastname dp');
    const followers = relationships.map(rel => rel.userId);
    res.status(200).json({ success: true, followers });
  } catch (error) {
    next(error);
  }
};

// 5. Get following
const getFollowing = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const relationships = await Following.find({ userId })
      .populate('followingId', 'username firstname lastname dp');
    const following = relationships.map(rel => rel.followingId);
    res.status(200).json({ success: true, following });
  } catch (error) {
    next(error);
  }
};

// 6. Search users
const searchUsers = async (req, res, next) => {
  console.log("Search request received:", req.query);
  try {
    // Check if req.user exists
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { q } = req.query;

    // Validate search query
    if (!q || q.length < 2) {
      return res.status(200).json({ success: true, users: [] });
    }

    const regex = new RegExp(q, 'i');
    
   

    // Perform the MongoDB query to find users
    const users = await User.find({
      $or: [
        { username: regex },
        { firstname: regex },
        { lastname: regex }
      ],
      _id: { $ne: req.user.id } // Exclude the current user from the search results
    })
    .select('username firstname lastname dp') // Specify the fields to return
    .limit(10); // Limit the results to 10 users
    console.log("Search results:", users);
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error while fetching users:", error);
    next(error); // Pass the error to the next handler
  }
};

// 7. Update user profile
const updateUserProfile = async (req, res, next) => {
  try {
    const { firstname, lastname, bio } = req.body;
    const safeUpdateData = { firstname, lastname, bio };

    if (req.file) {
      safeUpdateData.dp = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, safeUpdateData, { new: true }).select('-password');
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    next(error);
  }
};

const getSavedPosts = async (req, res, next) => {
    try {
        const saved = await SavedPost.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .populate({
                path: 'post',
                populate: {
                    path: 'user',
                    select: 'username dp'
                }
            });

        // Extract the full post objects from the result
        const savedPosts = saved.map(item => item.post);
        res.status(200).json({ success: true, savedPosts });
    } catch (error) {
        next(error);
    }
};

// Export all controllers
module.exports = {
  getProfileByUsername,
  getMyProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers,
  getDashboardData,
  updateUserProfile,
  getSavedPosts,
};