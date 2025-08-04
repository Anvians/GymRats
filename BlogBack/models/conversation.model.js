const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    // NEW: Reference to the last message sent in this conversation
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }
}, { timestamps: true }); 

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;