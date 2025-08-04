import React from 'react';
import { Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import './SidePanel.css';

const NotificationPanel = ({ isOpen, onClose, notifications }) => {
    const getMessage = (n) => {
        // ... this function remains the same
        switch(n.type) {
            case 'like': return `liked your post.`;
            case 'comment': return `commented on your post.`;
            case 'follow': return `started following you.`;
            default: return '';
        }
    };

    // NEW: A function to determine where the link should go
    const getNotificationLink = (notification) => {
        if (notification.type === 'like' || notification.type === 'comment') {
            // This will link to a future "single post" page, e.g., /posts/687f...
            return `/post/${notification.post?._id}`;
        }
        if (notification.type === 'follow') {
            // This links to the sender's profile page
            return `/profile/${notification.sender.username}`;
        }
        // Default fallback link
        return '#';
    };

    return (
        <>
            <div className={`side-panel-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
            <aside className={`side-panel ${isOpen ? 'open' : ''}`}>
                <header className="side-panel-header">
                    <h2>Notifications</h2>
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </header>
                <div className="side-panel-content">
                    {notifications.length > 0 ? notifications.map(n => (
                        // MODIFIED: The Link component now has a dynamic `to` prop and an `onClick` handler
                        <Link 
                            to={getNotificationLink(n)} 
                            className={`notification-item ${!n.read ? 'unread' : ''}`} 
                            key={n._id}
                            onClick={onClose} // This closes the panel when a notification is clicked
                        >
                            <img src={n.sender.dp || 'https://via.placeholder.com/50'} alt={n.sender.username} />
                            <p><strong>{n.sender.username}</strong> {getMessage(n)}</p>
                            {n.post && <img src={n.post.mediaUrl} className="post-thumbnail" alt="post"/>}
                        </Link>
                    )) : <p className="status-message">No new notifications.</p>}
                </div>
            </aside>
        </>
    );
};

export default NotificationPanel;