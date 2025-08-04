import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import './index.css'; // New CSS file for this component

const Comment = ({ comment, isCaption = false }) => {
  return (
    <div className="comment-wrapper">
      <img src={comment.user.dp} alt={comment.user.username} className="comment-user-dp" />
      <div className="comment-body">
        <p>
          <span className="comment-username">{comment.user.username}</span>
          {comment.text}
        </p>
        <div className="comment-meta">
          <span className="comment-timestamp">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
          {!isCaption && <button className="reply-button">Reply</button>}
        </div>
      </div>
    </div>
  );
};

export default Comment;