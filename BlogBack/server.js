// 1. Core Imports
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const path = require('path');
const http = require('http');
const { Server } = require("socket.io");
// const cloudinary = require('cloudinary').v2;
// const multer = require('multer');
// const fs = require('fs'); // Node.js File System module for deleting files
const jwt = require('jsonwebtoken');

// 2. Local Imports
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error.middleware');
const Message = require('./models/message.model');
const Conversation = require('./models/conversation.model');
const Notification = require('./models/notification.model');
const User = require('./models/user.model');

// --- Route Imports ---
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const conversationRoutes = require('./routes/conversation.routes');
const storyRoutes = require('./routes/story.routes');
const routineRoutes = require('./routes/routine.routes');
const workoutRoutes = require('./routes/workout.routes.js');

let onlineUsers = {};

// 3. Initialize App & DB Connection
const app = express();
connectDB();

const server = http.createServer(app);
// Corrected Socket.io CORS Configuration
const io = new Server(server, {
    cors: {
        origin: [process.env.CLIENT_URL, "http://localhost:3000"],
        methods: ["GET", "POST"]
    }
});

// 4. Socket.io Authentication Middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error: Token not provided.'));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error('Authentication error: Invalid token.'));
        }
        socket.user = decoded; // The payload contains { id, username, ... }
        next();
    });
});

// 5. Socket.io Connection Logic
io.on('connection', (socket) => {
    // ✅ FIX 1: Use 'id' from the JWT payload
    const connectedUserId = socket.user.id;
    if (!connectedUserId) return; // Prevent further execution if ID is missing

    console.log(`✅ User connected: ${connectedUserId} with socket ID: ${socket.id}`);
    onlineUsers[connectedUserId] = socket.id;

    io.emit('getOnlineUsers', Object.keys(onlineUsers));

    socket.on('joinRoom', (conversationId) => {
        socket.join(conversationId);
        console.log(`User ${connectedUserId} joined room: ${conversationId}`);
    });

    socket.on('sendMessage', async (messageData) => {
        const { conversationId, recipientId, text } = messageData;
        const senderId = socket.user.id; // ✅ FIX 1: Use 'id'

        try {
            const newMessage = new Message({
                conversationId,
                sender: senderId,
                text,
            });
            await newMessage.save();

            // ✅ FIX 2: Update the conversation with the new message's ID
            await Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: newMessage._id,
            });

            const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'username dp');
            io.to(conversationId).emit('receiveMessage', populatedMessage);

            const recipientSocketId = onlineUsers[recipientId];
            if (recipientSocketId) {
                const notification = new Notification({
                    recipient: recipientId,
                    sender: senderId,
                    type: 'message',
                    text: `sent you a message.`,
                    link: `/chat` // Link to the general chat page
                });
                await notification.save();
                const populatedNotification = await Notification.findById(notification._id).populate('sender', 'username dp');
                io.to(recipientSocketId).emit('newNotification', populatedNotification);
            }
        } catch (error) {
            console.error('Error in sendMessage:', error);
            socket.emit('sendMessageError', { message: 'Failed to send message.' });
        }
    });

    socket.on('sendNotification', async (data) => {
        const { recipientId, type, link, text } = data;
        const senderId = socket.user.id; // ✅ FIX 1: Use 'id'

        const recipientSocketId = onlineUsers[recipientId];
        if (recipientSocketId) {
            try {
                const notification = new Notification({
                    recipient: recipientId,
                    sender: senderId,
                    type,
                    link,
                    text,
                });
                await notification.save();
                const populatedNotification = await Notification.findById(notification._id).populate('sender', 'username dp');
                io.to(recipientSocketId).emit('newNotification', populatedNotification);
            } catch (error) {
                console.error('Error sending notification:', error);
            }
        }
    });

    socket.on('disconnect', () => {
        delete onlineUsers[connectedUserId];
        io.emit('getOnlineUsers', Object.keys(onlineUsers));
        console.log(`❌ User disconnected: ${connectedUserId}. Online users:`, Object.keys(onlineUsers).length);
    });
});

// 6. Core Middleware & Routes (omitted for brevity, no changes needed)
app.use(
  cors({
    origin: [process.env.CLIENT_URL, "http://localhost:3000"],
    credentials: true,
  })
);

// const upload = multer({ dest: 'uploads/' });


// app.post('/api/posts/create', upload.single('postImage'), async (req, res) => {
//   console.log('Request body:', req.body);
//   console.log('Request file:', req.file);

//   if (!req.file) {
//     return res.status(400).json({ message: "No file uploaded." });
//   }

//   try {
//     // Upload the file from the temporary path to Cloudinary
//     const result = await cloudinary.uploader.upload(req.file.path, {
//       folder: 'gymrats_posts', // Optional: saves to a specific folder in Cloudinary
//     });

//     // IMPORTANT: Clean up the temporary file from the 'uploads' folder
//     fs.unlinkSync(req.file.path);

//     // Now you have the secure URL from Cloudinary
//     const imageUrl = result.secure_url;
    
//     // --- DATABASE LOGIC ---
//     // Here, you would save the new post to your MongoDB database
//     // For example:
//     // const newPost = new Post({
//     //   title: req.body.title,
//     //   content: req.body.content,
//     //   imageUrl: imageUrl, // Save the Cloudinary URL
//     //   author: req.user.id // Assuming you have user auth middleware
//     // });
//     // await newPost.save();

//     console.log('File uploaded to Cloudinary:', imageUrl);

//     // Send a success response back to the client
//     res.status(201).json({ 
//       message: "Post created successfully!",
//       imageUrl: imageUrl, // Send the URL back to the frontend
//       // post: newPost // You might send the full new post object
//     });

//   } catch (error) {
//     console.error("Error uploading file:", error);
//     res.status(500).json({ message: "Error uploading file to Cloudinary." });
//   }
// });



app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/conversations", conversationRoutes);
app.use('/api/stories', storyRoutes);
app.use("/api/routines", routineRoutes);
app.use("/api/workouts", workoutRoutes);

// 8. Central Error Handling
app.use(errorHandler);

// 9. Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));