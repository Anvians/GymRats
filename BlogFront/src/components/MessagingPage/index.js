import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaSearch, FaVideo, FaPhone, FaInfoCircle, FaSmile, FaPaperclip } from "react-icons/fa";
import io from "socket.io-client";
import axios from "axios";
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { formatDistanceToNow } from "date-fns";

import "./index.css";

const ChatPlaceholder = () => (
    <div className="no-chat-selected">
        <div className="placeholder-icon"><FaPaperPlane /></div>
        <h2>Your Messages</h2>
        <p>Select a conversation to start chatting or find new friends.</p>
    </div>
);

const MessagingPage = () => {
    const [stories, setStories] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const socketRef = useRef();
    const messagesEndRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        const token = Cookies.get("auth_token");
        if (token) {
            const decodedToken = jwtDecode(token);
            setCurrentUser(decodedToken);
        }
    }, []);

    useEffect(() => {
        const token = Cookies.get("auth_token");
        if (!token || !currentUser) return;

        const headers = { headers: { Authorization: `Bearer ${token}` } };

        axios.get('http://localhost:5000/api/conversations', headers)
            .then(res => {
                const fetchedConversations = res.data.conversations;
                setConversations(fetchedConversations);
                const conversationToOpenId = location.state?.openConversationId;
                if (conversationToOpenId) {
                    const convoToSelect = fetchedConversations.find(c => c._id === conversationToOpenId);
                    if (convoToSelect) selectConversation(convoToSelect);
                } else if (fetchedConversations.length > 0) {
                    selectConversation(fetchedConversations[0]);
                }
            }).catch(err => console.error("Failed to fetch conversations:", err));

        // Stories fetch logic... (omitted for brevity, no changes needed)

        socketRef.current = io("http://localhost:5000", {
            auth: { token }
        });

        socketRef.current.on("receiveMessage", (message) => {
            setConversations(prevConvos => {
                const updatedConvos = prevConvos.map(convo => {
                    if (convo._id === message.conversationId) {
                        return { ...convo, lastMessage: message };
                    }
                    return convo;
                });
                return updatedConvos.sort((a, b) => new Date(b.lastMessage?.createdAt) - new Date(a.lastMessage?.createdAt));
            });
            if (message.conversationId === activeConversation?._id) {
                setMessages(prev => [...prev, message]);
            }
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [currentUser, location.state]);

    useEffect(() => {
        if (socketRef.current && activeConversation) {
            socketRef.current.emit("joinRoom", activeConversation._id);
        }
    }, [activeConversation]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const selectConversation = async (convo) => {
        setActiveConversation(convo);
        const token = Cookies.get("auth_token");
        try {
            const res = await axios.get(`http://localhost:5000/api/conversations/${convo._id}/messages`, { headers: { Authorization: `Bearer ${token}` } });
            setMessages(res.data.messages);
        } catch (err) {
            console.error("Failed to fetch messages:", err);
            setMessages([]);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        const otherUser = activeConversation?.participants[0];
        if (!newMessage.trim() || !socketRef.current || !currentUser || !otherUser) return;

        // ✅ FIX 3: Add recipientId to the payload
        const messageData = {
            text: newMessage,
            conversationId: activeConversation._id,
            recipientId: otherUser._id
        };
        socketRef.current.emit("sendMessage", messageData);

        // Optimistic UI update
        const optimisticMessage = {
            ...messageData,
            _id: Date.now(),
            sender: { _id: currentUser.id, username: currentUser.username, dp: currentUser.dp },
            createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, optimisticMessage]);

        setNewMessage("");
    };

    const otherUser = activeConversation?.participants[0];

    return (
        <div className="messaging-page">
            {/* Conversations Panel */}
            <aside className="conversations-panel">
                {/* Header, Search, Stories... */}
                <div className="conversation-items">
                    {conversations.map((convo) => (
                        <div
                            key={convo._id}
                            className={`convo-item ${activeConversation?._id === convo._id ? "active" : ""}`}
                            onClick={() => selectConversation(convo)}
                        >
                            <div className="convo-avatar-wrapper">
                                <img src={convo.participants[0]?.dp || "https://via.placeholder.com/50"} crossOrigin="anonymous" alt="" className="convo-avatar" />
                            </div>
                            <div className="convo-details">
                                <span className="convo-name">{convo.participants[0]?.username}</span>
                                {/* Check if lastMessage exists and has text */}
                                <span className="convo-last-message">
                                    {convo.lastMessage?.text ? convo.lastMessage.text : 'No messages yet...'}
                                </span>
                            </div>
                            <span className="convo-timestamp">
                                {/* Check if lastMessage exists before formatting time */}
                                {convo.lastMessage ? formatDistanceToNow(new Date(convo.lastMessage.createdAt), { addSuffix: true }) : ''}
                            </span>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Chat Window */}
            <main className="chat-window">
                {activeConversation && currentUser ? (
                    
                    <>
                        {/* Chat Header */}
                        <header className="chat-header">
    <div className="chat-header-left">
    {console.log('activeConversation', activeConversation)}
        <img
            src={activeConversation.participants[0]?.dp || "https://via.placeholder.com/50"}
            crossOrigin="anonymous"
            alt="User Avatar"
            className="chat-avatar"
        />
        <div className="chat-user-info">
            <span className="chat-username">{activeConversation.participants[0]?.firstname} {activeConversation.participants[0]?.lastname}</span>
            <p className="chat-status">Online</p> {/* Optional: If you want to show status */}
        </div>
    </div>
</header>


                        {/* Messages Area */}
                        <div className="messages-area">
                        
                          {messages.map((msg) => (
    <div 
        key={msg._id || msg.createdAt} 
        // ✅ FIX: Use optional chaining (?.) to prevent crash if sender is null
        className={`message-wrapper ${msg.sender?._id === currentUser.id ? "sent" : "received"}`}
    >
        <div className="message-bubble">{msg.text}</div>
    </div>
))}
                            <div ref={messagesEndRef} /> 
                        </div>

                        {/* Chat Input */}
                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            {/* ... input elements ... */}
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button className="send-button" type="submit"><FaPaperPlane /></button>
                        </form>
                    </>
                ) : (
                    <ChatPlaceholder />
                )}
            </main>
        </div>
    );
};

export default MessagingPage;