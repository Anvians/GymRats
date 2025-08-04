import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

import ProfileHeader from '../ProfileHeader';
import ProfileTabs from '../ProfileTabs';
import PostGrid from '../PostGrid';
import ProfileSkeleton from '../ProfileSkeleton';
import FollowListModal from '../FollowListModal'; // Import the new reusable modal
import './index.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [savedPosts, setSavedPosts] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [showModal, setShowModal] = useState(null); // State to control modal visibility
  const { username } = useParams();

 const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = Cookies.get("auth_token");

    // If there's no username in the URL, we're at /profile, so use the special 'me' endpoint.
    // Otherwise, use the username from the URL.
    const profileToFetch = username || 'me';
    const endpoint = `http://localhost:5000/api/users/profile/${profileToFetch}`;

    try {
        const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
            const fetchedProfile = response.data.profile;
            setProfile(fetchedProfile);

            // --- THE SIMPLIFIED & CORRECT LOGIC ---
            // 1. Decode the token to get the logged-in user's identity.
            const decodedToken = jwtDecode(token);

            // 2. Directly compare the logged-in user's username with the username of the profile we just fetched.
            // This is the most reliable way to check for ownership.
            setIsOwnProfile(decodedToken.username.toLowerCase() === fetchedProfile.username.toLowerCase());
        }

    } catch (err) {
        // ... your existing error handling ...
        setError("This gym rat doesn't exist!");
        console.error("Error fetching profile:", err);
    } finally {
        setLoading(false);
    }
}, [username]); // The dependency is correct
console.log('profile_data', profile);

  useEffect(() => {
    if (activeTab === "saved") {
      const fetchSavedPosts = async () => {
        setSavedLoading(true);
        try {
          const token = Cookies.get("auth_token");
          const response = await axios.get(
            "http://localhost:5000/api/users/me/saved",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setSavedPosts(response.data.savedPosts);
        } catch (error) {
          console.error("Failed to fetch saved posts:", error);
        } finally {
          setSavedLoading(false);
        }
      };
      fetchSavedPosts();
    }
  }, [activeTab]); // Rerun when activeTab changes

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="profile-error-container">
        {error === "This gym rat doesn't exist!"
          ? "Sorry, the user profile doesn't exist or has been deleted."
          : error}
      </div>
    );
  }

  return (
     <div className="profile-page-container">
      {profile && (
        <ProfileHeader
          isOwnProfile={isOwnProfile}
          profile={profile}
          // Pass the functions to open the modals down to the header
          onFollowersClick={() => setShowModal('followers')}
          onFollowingClick={() => setShowModal('following')}
        />
      )}

      {/* 2. Story Highlights (a new feature suggestion) */}
      <div className="story-highlights">
        <div className="highlight-circle">
          <p>Leg Day</p>
        </div>
        <div className="highlight-circle">
          <p>PRs</p>
        </div>
        <div className="highlight-circle">
          <p>Meals</p>
        </div>
        <div className="highlight-circle add-new">+</div>
      </div>

      {/* 3. The Tabs for switching between Posts, Saved, etc. */}
      <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 4. The content grid that changes based on the active tab */}
      <div className="profile-content">
        {activeTab === "posts" && <PostGrid posts={profile.posts} />}
        {activeTab === "saved" &&
          (savedLoading ? (
            <p>Loading saved posts...</p>
          ) : (
            <PostGrid posts={savedPosts} />
          ))}{" "}
        {activeTab === "tagged" && (
          <div className="placeholder-content">
            Posts you're tagged in will appear here.
          </div>
        )}
      </div>

      {showModal && (
        <FollowListModal
          title={showModal === 'followers' ? 'Followers' : 'Following'}
          users={showModal === 'followers' ? profile.followers : profile.following}
          closeModal={() => setShowModal(null)}
        />
      )
      }

    </div>
  );
};

export default Profile;
