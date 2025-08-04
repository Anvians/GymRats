import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { formatDistanceToNow } from "date-fns"; // For relative timestamps

// Import your icon components or SVGs

import { FaHeart, FaComment, FaShare, FaBookmark } from "react-icons/fa";
import Comments from "../Comments"; // Your existing comments component
import "./index.css"; // We'll create this CSS file

const PostCard = ({
  post,
  currentUser,
  onLikeUpdate,
  isSaved,
  onSaveToggle,
}) => {
  const [showComments, setShowComments] = useState(false);

console.log('debugging the post', post)

  // A more robust check for whether the current user has liked the post
  const isLiked = post.likes.includes(currentUser?._id);

  const handleLike = async () => {
    const token = Cookies.get("auth_token");

    // --- Optimistic UI Update ---
    // Immediately update the UI for a snappy user experience
    const newLikes = isLiked
      ? post.likes.filter((id) => id !== currentUser._id)
      : [...post.likes, currentUser._id];
    onLikeUpdate(post._id, newLikes);
    // ----------------------------

    try {
      await axios.post(
        "http://localhost:5000/like",
        { postId: post._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // The server request happens in the background. If it fails,
      // we need to revert the state (see advanced section below).
    } catch (error) {
      console.error("Failed to like post:", error);
      // --- Revert on Error ---
      // If the API call fails, revert the change to reflect the true state
      onLikeUpdate(post._id, post.likes);
      alert("Failed to update like. Please try again.");
    }
  };

  return (
    <div className="post-card">
      {/* Post Header */}
      <div className="post-header">
        <Link to={`/postuser/${post.user.username}`} className="user-info">
          <img
            src={post.user.dp}
            alt={post.user.username}
            className="user-dp"
            crossOrigin="anonymous"
          />
          <span className="username">{post.user.username}</span>
        </Link>
        <span className="post-options">...</span>
      </div>

      {/* Post Media */}
      <div className="post-media-container">
        {post.mediaUrl &&
        (post.mediaUrl.endsWith(".mp4") || post.mediaUrl.endsWith(".webm")) ? (
          <video
            controls
            muted
            autoPlay
            loop
            className="post-media"
            src={post.media}
            type="video/mp4"
            crossOrigin="anonymous"
          />
        ) : post.mediaUrl ? (
          <img
            src={post.mediaUrl}
            crossOrigin="anonymous"
            alt="Post content"
            className="post-media"
          />
        ) : (
          <div className="no-media">No media available</div>
        )}
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="main-actions">
          <FaHeart color={isLiked ? "red" : "gray"} onClick={handleLike} />
          <FaComment onClick={() => setShowComments(true)} />
          <FaShare />
        </div>
        <div className="save-action">
          <FaBookmark
            filled={isSaved}
            onClick={() => onSaveToggle(post._id, isSaved)}
          />
        </div>
      </div>

      {/* Post Info */}
      <div className="post-info">
        <p className="likes-count">{post.likes.length} likes</p>
        <div className="caption">
          <span className="username">{post.user.username}</span>
          <p>{post.caption || "Great workout today! #gymrat"}</p>{" "}
          {/* Added Caption */}
        </div>
        <p className="comments-link" onClick={() => setShowComments(true)}>
          View all {post.comments.length} comments
        </p>
        <p className="post-timestamp">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Comment Modal */}
      {showComments && (
        <Comments closeModal={() => setShowComments(false)} post_data={post} />
      )}
    </div>
  );
};

export default PostCard;
