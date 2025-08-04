import React from 'react';
import './index.css'; // We'll create this CSS file

const PostSkeleton = () => {
  return (
    <div className="post-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-dp"></div>
        <div className="skeleton-username"></div>
      </div>
      <div className="skeleton-media"></div>
      <div className="skeleton-actions">
        <div className="skeleton-action-icon"></div>
        <div className="skeleton-action-icon"></div>
      </div>
      <div className="skeleton-text-line"></div>
      <div className="skeleton-text-line short"></div>
    </div>
  );
};

export default PostSkeleton;