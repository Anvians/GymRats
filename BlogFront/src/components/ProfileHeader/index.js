import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaUserPlus, FaUserCheck, FaCog } from 'react-icons/fa';
import './index.css';

// Reusable component for displaying stats
const ProfileStat = ({ count, label, onClick }) => (
  <div className={`stat-item ${onClick ? 'clickable' : ''}`} onClick={onClick}>
    <span className="stat-count">{count}</span>
    <span className="stat-label">{label}</span>
  </div>
);

const ProfileHeader = ({ profile, isOwnProfile, onFollowersClick, onFollowingClick }) => {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(profile.isFollowedByMe);
  const [followerCount, setFollowerCount] = useState(profile.followerCount);
  const [followLoading, setFollowLoading] = useState(false);

  const handleFollowToggle = async () => {
    setFollowLoading(true);
    const token = Cookies.get("auth_token");
    const endpoint = isFollowing ? "/unfollow" : "/follow";

    // Optimistic UI update for a snappy feel
    setIsFollowing(!isFollowing);
    setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));

    try {
      await axios.post(
        `http://localhost:5000/api/users${endpoint}`,
        { followingId: profile._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Follow/unfollow failed:", error);
      // Revert UI on error
      setIsFollowing(!isFollowing);
      setFollowerCount((prev) => (isFollowing ? prev + 1 : prev - 1));
      alert("Something went wrong. Please try again.");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessageClick = async () => {
    try {
      const token = Cookies.get("auth_token");
      const response = await axios.post(
        "http://localhost:5000/api/conversations/findOrCreate",
        { otherUserId: profile._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { conversation } = response.data;

      // Redirect to the messaging page, passing the conversation ID in the state
      navigate("/messages", {
        state: { openConversationId: conversation._id },
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
      alert("Could not start a conversation. Please try again.");
    }
  };

  return (
    <header className="profile-header">
      <div className="header-top">
        <div className="profile-image-container">
          <img
            src={profile.dp || 'https://via.placeholder.com/150'}
            crossOrigin="anonymous"
            alt={profile.username}
            className="profile-avatar"
          />
        </div>
        <div className="profile-stats">
          <ProfileStat count={profile.postCount} label="Posts" />
          {/* Call the handler passed from the Profile component */}
          <ProfileStat
            count={followerCount}
            label="Followers"
            onClick={onFollowersClick}
          />
          {/* Call the handler passed from the Profile component */}
          <ProfileStat
            count={profile.followingCount}
            label="Following"
            onClick={onFollowingClick}
          />
        </div>
      </div>

      <div className="profile-info">
        <h1 className="full-name">
          {profile.firstname} {profile.lastname}
        </h1>
        <p className="username">@{profile.username}</p>
        <p className="bio">{profile.bio}</p>
      </div>

      {/* --- SECTION 3: Action Buttons --- */}
      <div className="profile-actions">
        {isOwnProfile ? (
          <>
            <button
              className="btn primary"
              onClick={() => navigate("/profile/edit")}
            >
              Edit Profile
            </button>
            <button className="btn secondary">
              <FaCog /> Settings
            </button>
          </>
        ) : (
          <>
            <button
              className="btn primary"
              onClick={handleFollowToggle}
              disabled={followLoading}
            >
              {isFollowing ? (
                <>
                  <FaUserCheck /> Unfollow
                </>
              ) : (
                <>
                  <FaUserPlus /> Follow
                </>
              )}
            </button>
            <button className="btn secondary" onClick={handleMessageClick}>
              Message
            </button>{" "}
          </>
        )}
      </div>
    </header>
  );
};
export default ProfileHeader;
