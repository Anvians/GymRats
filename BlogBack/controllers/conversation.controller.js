const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const { User } = require('../models/user.model');

// @desc    Get all conversations for the logged-in user
const getConversations = async (req, res, next) => {
    try {
        let conversations = await Conversation.find({ participants: req.user.id })
            .populate({
                path: 'participants',
                select: 'username dp firstname lastname', // 'dp' for display picture
                match: { _id: { $ne: req.user.id } } // Exclude self
            })
            .populate({
                path: 'lastMessage',
                select: 'text sender createdAt'
            })
            .sort({ updatedAt: -1 });
        
        // ✅ **THE FIX: Add this line to filter out empty conversations**
        // This ensures every conversation sent to the client has another participant.
        const filteredConversations = conversations.filter(c => c.participants.length > 0);

        res.status(200).json({ success: true, conversations: filteredConversations });

    } catch (error) {
        next(error);
    }
};

// @desc    Get all messages for a specific conversation
const getMessages = async (req, res, next) => {
    try {
        const messages = await Message.find({ conversationId: req.params.id })
            .populate('sender', 'username dp');
        
        res.status(200).json({ success: true, messages });
    } catch (error) {
        next(error);
    }
};

const findOrCreateConversation = async (req, res, next) => {
    try {
        const { otherUserId } = req.body;
        const loggedInUserId = req.user.id;

        if (!otherUserId) {
            res.status(400);
            throw new Error('Other user ID is required.');
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [loggedInUserId, otherUserId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [loggedInUserId, otherUserId]
            });
        }
        
        res.status(200).json({ success: true, conversation });

    } catch (error) {
        next(error);
    }
};
module.exports = { getConversations, getMessages, findOrCreateConversation };