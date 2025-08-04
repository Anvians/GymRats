
// PostGrid.js
import React from 'react';
import { FaHeart, FaComment } from 'react-icons/fa';
import './index.css';


const PostGrid = ({ posts }) => (
  <div className="post-grid">
    {posts.map(post => (
      <div className="post-thumbnail" key={post._id}>
        <img src={post.mediaUrl} crossOrigin='anonymous'  alt="Post" />
        <div className="post-overlay">
          <div className="post-stats">
            <span><FaHeart /> {post.likes.length}</span>
            <span><FaComment /> {post.comments.length}</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default PostGrid;