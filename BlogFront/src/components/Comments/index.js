import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { formatDistanceToNow } from "date-fns";

// Import new and existing components
import Comment from "../Comment";
import CommentSkeleton from "../CommentSkeleton"; // Loading placeholder
import { FaTimes, FaPaperPlane } from "react-icons/fa";import "./comments.css"; // We will replace the old CSS

const Comments = ({ closeModal, post_data }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  
  // Ref for the comment list to auto-scroll to the bottom
  const commentsEndRef = useRef(null);
  
  // Disable body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Auto-scroll to the newest comment
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  // Fetch comments for the post
  const fetchComments = useCallback(async () => {
    const token = Cookies.get("auth_token");
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/comments/${post_data._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        setComments(response.data.comments);
      } else {
        throw new Error("Could not fetch comments.");
      }
    } catch (err) {
      setError("Failed to load comments. Please try again later.");
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  }, [post_data._id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);
  
  // Handle posting a new comment
  const handlePostComment = async (e) => {
    e.preventDefault(); // Prevent form submission from reloading the page
    if (!newComment.trim() || isPosting) return;

    const token = Cookies.get("auth_token");
    setIsPosting(true);
    
    try {
      const response = await axios.post(
        "http://localhost:5000/comment",
        { postId: post_data._id, text: newComment }, // Assuming your backend expects 'text'
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setComments((prev) => [...prev, response.data.comment]);
        setNewComment(""); // Clear input field
      } else {
        throw new Error("Failed to post comment from server.");
      }
    } catch (err) {
      console.error("Server Error:", err);
      alert("Something went wrong. Could not post your comment.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="close-button" onClick={closeModal}><FaTimes size={22} /></div>
      
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Left Side: Post Media */}
        <div className="modal-media-panel">
          {post_data.media.endsWith(".mp4") || post_data.media.endsWith(".webm") ? (
            <video crossOrigin="anonymous" controls autoPlay loop muted src={post_data.media} />
          ) : (
            <img crossOrigin="anonymous" src={post_data.media} alt="Post content" />
          )}
        </div>

        {/* Right Side: Header, Comments, and Input */}
        <div className="modal-comments-panel">
          {/* Panel Header */}
          <header className="panel-header">
            <img src={post_data.user.dp} alt={post_data.user.username} className="header-user-dp" />
            <span className="header-username">{post_data.user.username}</span>
          </header>

          {/* Comments List */}
          <div className="comments-list">
            {/* Display post caption as the first "comment" */}
            {post_data.caption && (
              <Comment comment={{
                  user: post_data.user,
                  text: post_data.caption,
                  createdAt: post_data.createdAt
              }} isCaption={true} />
            )}

            {/* Handle Loading, Error, and Content states */}
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <CommentSkeleton key={i} />)
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : comments.length > 0 ? (
              comments.map((comment) => <Comment key={comment._id} comment={comment} />)
            ) : (
              <div className="no-comments-message">
                <h3>No comments yet.</h3>
                <p>Start the conversation.</p>
              </div>
            )}
            <div ref={commentsEndRef} /> {/* Dummy div for auto-scrolling */}
          </div>

          {/* Comment Input Form */}
          <form className="comment-input-form" onSubmit={handlePostComment}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              disabled={isPosting}
            />
            <button type="submit" disabled={!newComment.trim() || isPosting}>
              {isPosting ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Comments;