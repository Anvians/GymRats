import React from 'react';
import './index.css'; // New CSS file

const CommentSkeleton = () => {
  return (
    <div className="comment-skeleton-wrapper">
      <div className="skeleton-dp" />
      <div className="skeleton-body">
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
      </div>
    </div>
  );
};

export default CommentSkeleton;