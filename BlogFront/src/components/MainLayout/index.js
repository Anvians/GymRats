import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom'; // IMPORTANT: Add Outlet
import Cookies from 'js-cookie';
import axios from 'axios';

// Import your custom components and icons
import CreatePostModal from '../CreatePostModel'; 
import { GiMuscleUp } from 'react-icons/gi';
import { FaPlusSquare, FaBars, FaTimes } from 'react-icons/fa';
import './index.css'; 

// Renamed from Header to MainLayout to match App.js
const MainLayout = () => { 
  const [user, setUser] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(window.scrollY);
  const navigate = useNavigate();
  const profileRef = useRef(null);

  // Effect to fetch user data
  useEffect(() => {
    const token = Cookies.get('auth_token');
    if (!token) {
        // If no token, forcefully navigate to login. This is a safety check.
        navigate('/login');
        return;
    };

    const fetchUserData = async () => {
      try {
        // Use the /api/auth/me route we created for this exact purpose
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        // If token is invalid, clear it and redirect to login
        Cookies.remove('auth_token');
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  // Effect for controlling navbar visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (lastScrollY.current < currentScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Effect to close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
        if (profileRef.current && !profileRef.current.contains(event.target)) {
            setIsProfileDropdownOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileRef]);

  const handleSignOut = () => {
    Cookies.remove('auth_token');
    setUser(null);
    navigate('/login');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // If the user data is still loading, you can show a loading spinner
  // to prevent the UI from flashing a "Log In" button briefly.
  if (!user) {
    return <div>Loading user...</div>; // Or a proper loading spinner component
  }

  return (
    <>
      {/* This is your header UI */}
      <header className={`header ${isVisible ? 'visible' : 'hidden'}`}>
        <nav className="header-nav container">
          <NavLink to="/home" className="header-logo">
            <GiMuscleUp size={32} />
            <h1>Gym Rat</h1>
          </NavLink>

          <ul className="nav-menu-desktop">
            <li><NavLink to="/home">Home</NavLink></li>
            <li><NavLink to="/dashboard">Dashboard</NavLink></li>
          </ul>

          <div className="nav-actions">
            <button className="create-btn" onClick={() => setShowUploadModal(true)}>
              <FaPlusSquare size={22} />
              <span>Create</span>
            </button>
            <div className="profile-container" ref={profileRef}>
              <img
                src={user.dp || 'https://via.placeholder.com/40'}
                alt="Profile"
                className="profile-dp"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              />
              {isProfileDropdownOpen && (
                <div className="profile-dropdown">
                  <NavLink to="/profile" onClick={() => setIsProfileDropdownOpen(false)}>My Profile</NavLink>
                  <NavLink to="/profile/edit" onClick={() => setIsProfileDropdownOpen(false)}>Edit Profile</NavLink>
                  <button onClick={handleSignOut}>Sign Out</button>
                </div>
              )}
            </div>
            <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <FaTimes size={22}/> : <FaBars size={22}/>}
            </button>
          </div>
        </nav>
      </header>

      {/* This is the mobile menu overlay */}
      <div className={`nav-menu-mobile ${isMobileMenuOpen ? 'open' : ''}`}>
        <NavLink to="/home" onClick={closeMobileMenu}>Home</NavLink>
        <NavLink to="/dashboard" onClick={closeMobileMenu}>Dashboard</NavLink>
      </div>

      {/* This is your create post modal */}
      {showUploadModal && <CreatePostModal closeModal={() => setShowUploadModal(false)} />}
      
      {/* This is the CRUCIAL part.
        <Outlet /> is the placeholder where React Router will render the actual page
        component (e.g., <Home />, <Profile />, etc.).
      */}
      <main className="main-content-area">
        <Outlet />
      </main>
    </>
  );
};

export default MainLayout;