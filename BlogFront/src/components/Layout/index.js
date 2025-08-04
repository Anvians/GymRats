import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import { useRef } from 'react';
import Sidebar from "../Sidebar";
import SearchPanel from "../SearchPanel";
import NotificationPanel from "../NotificationPanel";
import CreatePostModal from "../CreatePostModel";
import "./index.css";

const Layout = () => {
    const [activePanel, setActivePanel] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
        const socketRef = useRef();
useEffect(() => {
        const token = Cookies.get("auth_token");
        if (!token) return;

        // Connect to the socket server
        socketRef.current = io("http://localhost:5000");
        
        // 1. Tell the server who we are
        const decoded = jwtDecode(token);
        socketRef.current.emit('addUser', decoded.id);

        // 2. Listen for new notification events from the server
        socketRef.current.on('newNotification', (newNotification) => {
            // Simply increment the unread count
            setUnreadCount(prevCount => prevCount + 1);
            // Optionally, add the new notification to the top of the list
            setNotifications(prev => [newNotification, ...prev]);
        });
        
        // Clean up on disconnect
        return () => socketRef.current.disconnect();

    }, []);
    // Fetch notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            const token = Cookies.get("auth_token");
            try {
                const res = await axios.get("http://localhost:5000/api/notifications", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setNotifications(res.data.notifications);
                setUnreadCount(res.data.notifications.filter((n) => !n.read).length);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };
        fetchNotifications();
    }, []);

    const handleSignOut = () => {
        Cookies.remove("auth_token");
        navigate("/login");
    };

    const markNotificationsAsRead = async () => {
        if (unreadCount > 0) {
            try {
                const token = Cookies.get("auth_token");
                await axios.post("http://localhost:5000/api/notifications/read", {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUnreadCount(0);
            } catch (error) {
                console.error("Failed to mark notifications as read", error);
            }
        }
    };

    return (
        <div className="app-layout">
            <Sidebar 
                onSignOut={handleSignOut}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                openSearch={() => setActivePanel('search')}
                openNotifications={() => {
                    setActivePanel('notifications');
                    markNotificationsAsRead();
                }}
                unreadCount={unreadCount}
            />

            <SearchPanel isOpen={activePanel === 'search'} onClose={() => setActivePanel(null)} />
            <NotificationPanel isOpen={activePanel === 'notifications'} onClose={() => setActivePanel(null)} notifications={notifications} />
            {isCreateModalOpen && <CreatePostModal closeModal={() => setIsCreateModalOpen(false)} />}

           <main className="main-content">
                <Outlet context={{ socket: socketRef.current }} />
            </main>
        </div>
    );
};

export default Layout;