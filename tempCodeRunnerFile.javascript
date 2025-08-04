import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaSearch } from "react-icons/fa";
import io from "socket.io-client";
import axios from "axios";
import Cookies from "js-cookie";
import Sidebar from "../Sidebar";
import "./index.css"; // We will create this new CSS file

const MessagingPage = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const currentUserId = "currentUser"; // Replace with actual logic to get current user ID

  useEffect(() => {
    // Fetch conversations
    const token = Cookies.get("auth_token");
    axios.get("http://localhost:5000/api/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setConversations(res.data.conversations);
        if (res.data.conversations.length > 0) {
          selectConversation(res.data.conversations[0]);
        }
      })
      .catch(err => console.error("Failed to fetch conversations:", err));
  }, []);

  useEffect(() => {
    // Socket connection
    if (!activeConversation) return;
    socketRef.current = io("http://localhost:5000");
    socketRef.current.emit("joinRoom", activeConversation._id);
    socketRef.current.on("receiveMessage", (message) => {
      if (message.conversationId === activeConversation._id) {
        setMessages((prev) => [...prev, message]);
      }
    });
    return () => socketRef.current.disconnect();
  }, [activeConversation]);

  useEffect(() => {
    // Scroll to new messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectConversation = async (convo) => {
    setActiveConversation(convo);
    const token = Cookies.get("auth_token");
    try {
        const res = await axios.get(
            `http://localhost:5000/api/conversations/${convo._id}/messages`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data.messages);
    } catch (err) {
        console.error("Failed to fetch messages:", err);
        setMessages([]); // Clear messages on error
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;
    const messageData = {
      text: newMessage,
      conversationId: activeConversation._id,
      // The sender ID should be set on the backend from the authenticated socket
    };
    socketRef.current.emit("sendMessage", messageData);
    // Optimistically update UI
    setMessages((prev) => [...prev, { ...messageData, sender: { _id: currentUserId } }]);
    setNewMessage("");
  };

  const otherUser = activeConversation?.participants[0];

  return (
    <div className="messaging-page">
      <Sidebar
        isCollapsed={true} // The sidebar is always collapsed on this page
        onSignOut={() => console.log("Sign out")}
        onMessagesClick={() => console.log("Messages")}
        openSearch={() => console.log("Search")}
        openNotifications={() => console.log("Notifications")}
        onOpenCreateModal={() => console.log("Create")}
      />

    <div className="messaging-container">
      <div className="conversation-list">
        {conversations.map((convo) => (
          <div
            key={convo._id}
            className={`conversation-item ${activeConversation?._id === convo._id ? "active" : ""}`}
            onClick={() => selectConversation(convo)}
          >
            {convo.participants[0].name}
          </div>
        ))}
      </div>

      <div className="chat-window">
        {activeConversation ? (
          <>
            <div className="chat-header">
              <h2>{otherUser?.name}</h2>
            </div>
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender._id === currentUserId ? "sent" : "received"}`}>
                  {msg.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form className="message-input" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit"><FaPaperPlane /></button>
            </form>
          </>
        ) : (
          <div className="no-conversation">Select a conversation to start chatting</div>
        )}
      </div>      <div className="search-users-panel">
        <div className="search-input-container">
          <input type="text" placeholder="Search users..." className="search-users-input" />
          <FaSearch className="search-icon" />
        </div>
        <div className="search-results">
          {/* Search results will go here */}
          <div className="search-result-item">
            <span className="search-result-name">User Name 1</span>
            <button className="start-chat-button">Chat</button>
          </div>
          <div className="search-result-item">
            <span className="search-result-name">User Name 2</span>
            <button className="start-chat-button">Chat</button>
          </div>
        </div>
      </div>


    </div>
      
    </div>
  );
};

export default MessagingPage;