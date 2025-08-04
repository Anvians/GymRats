// ProfileTabs.js
import React from 'react';
import { FaTh, FaBookmark, FaUserTag } from 'react-icons/fa';
import './index.css';

const ProfileTabs = ({ activeTab, setActiveTab }) => (
  <div className="profile-tabs">
    <button className={activeTab === 'posts' ? 'active' : ''} onClick={() => setActiveTab('posts')}>
      <FaTh /> POSTS
    </button>
    <button className={activeTab === 'saved' ? 'active' : ''} onClick={() => setActiveTab('saved')}>
      <FaBookmark /> SAVED
    </button>
    <button className={activeTab === 'tagged' ? 'active' : ''} onClick={() => setActiveTab('tagged')}>
      <FaUserTag /> TAGGED
    </button>
  </div>
);

export default ProfileTabs;
