import React from 'react';
import './index.css'; // We will create this CSS file

const ProfileSkeleton = () => {
  return (
    <div className="profile-skeleton-container">
      {/* Skeleton for Profile Header */}
      <header className="skeleton-header">
        <div className="skeleton-header-top">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-stats">
            <div className="skeleton-stat-item">
              <div className="skeleton-line short"></div>
              <div className="skeleton-line tiny"></div>
            </div>
            <div className="skeleton-stat-item">
              <div className="skeleton-line short"></div>
              <div className="skeleton-line tiny"></div>
            </div>
            <div className="skeleton-stat-item">
              <div className="skeleton-line short"></div>
              <div className="skeleton-line tiny"></div>
            </div>
          </div>
        </div>
        <div className="skeleton-info">
          <div className="skeleton-line medium"></div>
          <div className="skeleton-line short"></div>
          <div className="skeleton-line long"></div>
          <div className="skeleton-line long"></div>
        </div>
        <div className="skeleton-actions">
          <div className="skeleton-btn"></div>
          <div className="skeleton-btn"></div>
        </div>
      </header>

      {/* Skeleton for Story Highlights */}
      <div className="skeleton-highlights">
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="skeleton-highlight-circle" key={i}></div>
        ))}
      </div>

      {/* Skeleton for Tabs */}
      <div className="skeleton-tabs">
        <div className="skeleton-tab"></div>
        <div className="skeleton-tab"></div>
        <div className="skeleton-tab"></div>
      </div>
      
      {/* Skeleton for Post Grid */}
      <div className="skeleton-post-grid">
        {Array.from({ length: 9 }).map((_, i) => (
          <div className="skeleton-post-square" key={i}></div>
        ))}
      </div>
    </div>
  );
};

export default ProfileSkeleton;