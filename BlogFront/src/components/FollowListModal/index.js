import React from 'react';
import { Link } from 'react-router-dom';
import './index.css'; // Create a CSS file for modal styles

const FollowListModal = ({ title, users, closeModal }) => {
  console.log('title in follow list model', users)
  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button onClick={closeModal} className="modal-close-btn">
            &times;
          </button>
        </div>
        <div className="modal-body">
          {users && users.length > 0 ? (
            users.map((user) => (
              <div key={user._id} className="user-row">
                <Link to={`/profile/${user.username}`} className="user-info" onClick={closeModal}>
                  <img
                    src={user.dp || 'https://via.placeholder.com/50'}
                    alt={user.username}
                    className="user-avatar"
                    crossOrigin="anonymous"
                  />
                  <div className="user-details">
                    <span className="user-username">{user.username}</span>
                    <span className="user-fullname">
                      {user.firstname} {user.lastname}
                    </span>
                  </div>
                </Link>
                {/* Optional: You can add a follow/unfollow button here */}
              </div>
            ))
          ) : (
            <p className="no-users-message">No {title.toLowerCase()} to display.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;