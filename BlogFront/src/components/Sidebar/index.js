// components/Sidebar.js
import React from "react";
import { NavLink } from "react-router-dom";
import { FaBell, FaHome, FaSearch, FaPlusSquare, FaUser, FaChartBar, FaSignOutAlt, FaRunning, FaCommentDots } from "react-icons/fa";
import { GiMuscleUp } from "react-icons/gi";
import "./index.css";

const Sidebar = ({ onSignOut, onOpenCreateModal, openSearch, openNotifications, unreadCount }) => {
  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-header">
          <GiMuscleUp size={36} className="logo-icon" />
          <h1 className="logo-text">Gym Rat</h1>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/home" className="nav-item">
            <FaHome size={24} /><span className="nav-label">Home</span>
          </NavLink>
          <NavLink to="/workouts" className="nav-item">
            <FaRunning size={24} /><span className="nav-label">Workouts</span>
          </NavLink>
          <NavLink to="/dashboard" className="nav-item">
            <FaChartBar size={24} /><span className="nav-label">Dashboard</span>
          </NavLink>
          <NavLink to="/messages" className="nav-item">
            <FaCommentDots size={24} /><span className="nav-label">Messages</span>
          </NavLink>
          <NavLink to="/profile" className="nav-item">
            <FaUser size={24} /><span className="nav-label">Profile</span>
          </NavLink>
          <button className="nav-item" onClick={openSearch}>
            <FaSearch size={24} /><span className="nav-label">Search</span>
          </button>
          <button className="nav-item" onClick={openNotifications}>
            <FaBell size={24} /><span className="nav-label">Notifications</span>
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          <button className="nav-item" onClick={onOpenCreateModal}>
            <FaPlusSquare size={24} /><span className="nav-label">Create</span>
          </button>
        </nav>
      </div>
      <div className="sidebar-footer">
        <button className="nav-item signout-button" onClick={onSignOut}>
          <FaSignOutAlt size={24} /><span className="nav-label">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;