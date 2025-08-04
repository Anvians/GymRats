import React, { useEffect, useState } from "react";
import "./index.css";
import UploadDp from "../UploadDp";
import Cookies from "js-cookie";
import TabMedia from "../Tabs/TabMedia";
import axios from "axios";
import Following from "../Following";
import { useParams, useLocation } from "react-router-dom";

const Profile = () => {
  const [followingClick, setFollowingClick] = useState(false);
  const [followerClick, setFollowerClick] = useState(false);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [searchedId, setSearchedId] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [userDataPass, setUserDataPass] = useState(null);
  const [followerPass, setFollowerPass] = useState(null); // now used
  const [seachedfollowerLen, setSearchedFollowerLen] = useState(null);
  const [userPostData, setUserPostData] = useState(null);
  const [following, setFollowing] = useState(false);

  const token = Cookies.get("auth_token");
  const { username } = useParams();
  const location = useLocation();
  const { userList } = location.state || {};
 
  // Fetch user profile data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/user/${username}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [username]);

  useEffect(() => {
    if (user) {
      setUserId(user._id);
    }
  }, [user]);

  // Fetch following data
  useEffect(() => {
    const getFollowing = async () => {
      if (!token || !userId) return;
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/postfollowing`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { userId },
        });
        const data = res.data;
        console.log("Following data in get following", data);
        if (data.success) {
          setUserDataPass(data.following);
          setUserPostData(data.following.length);
        }
      } catch (error) {
        console.error("Error fetching following data:", error);
      }
    };
    getFollowing();
  }, [userId]);





  // Get searched user ID
  useEffect(() => {
    const usernameToId = async () => {
      if (!username || !token) return;
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/searchedfollowers/${username}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = res.data;
        if (data.success) {
          setSearchedId(data.searchedId);
        }
      } catch (error) {
        console.error("Error fetching searched user ID:", error);
      }
    };
    usernameToId();
  }, [username, token]);

  // Fetch followers
  useEffect(() => {
    const fetchFollowers = async () => {
      if (!searchedId || !token) return;
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/followers/${searchedId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Follower data in get followers", res.data);
        const data = res.data;
        console.log("Follower data_ below", data);
        if (data.success) {
          setFollowerPass(data.followers); // Now storing follower list
          setSearchedFollowerLen(data.followersCount);
        }
      } catch (error) {
        console.error("Error fetching followers:", error);
      }
    };
    fetchFollowers();
  }, [searchedId, token]);

  // Check if following
  useEffect(() => {
    const isFollowing = async () => {
      if (!userList || !token) return;
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/following/check/${userList._id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (data.success) {
          setFollowing(true);
        }
      } catch (error) {
        console.error("Error checking follow status", error);
      }
    };
    isFollowing();
  }, [userList, token]);

  const followUser = async () => {
    if (!token || !userList) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ followingId: userList._id }),
      });
      const data = await res.json();
      if (data.success) {
        setFollowing(true);
        setSearchedFollowerLen((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const unfollow = async () => {
    if (!token || !userList) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/unfollow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ followingId: userList._id }),
      });
      const data = await res.json();
      if (data.success) {
        setFollowing(false);
        setSearchedFollowerLen((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="user-profile">
      <div className="img-name">
      <h1>this is post user profile</h1>
        <img
          src={
            user.dp ||
            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
          }
          alt="User Avatar"
          className="profile-image"
        />
        {showUpload && <UploadDp closeModal={() => setShowUpload(false)} />}
        <p className="user-email-username">@{user.username}</p>
        <h2 className="user-email">
          {user.firstname} {user.lastname}
        </h2>
        <p className="user-email-bio">{user.bio}</p>
      </div>

      <div className="following-followers">
        <p className="following-class" onClick={() => setFollowingClick(true)}>
          Following {userPostData}
        </p>
        <p className="follower-class" onClick={() => setFollowerClick(true)}>
          Followers {seachedfollowerLen}
        </p>
      </div>

     

      <div>
        {followingClick && (
          <Following
            closeModal={() => setFollowingClick(false)}
            post_data={userDataPass}
          />
        )}
        {followerClick && (
          <Following
            closeModal={() => setFollowerClick(false)}
            post_data={followerPass}
          />
        )}
      </div>
{console.log('userDataPass', userDataPass)}
{console.log('followerPass', followerPass)}
      {
        <>
          {following ? (
            <button onClick={unfollow}>Unfollow</button>
          ) : (
            <button onClick={followUser}>Follow</button>
          )}
        </>
      }

      <hr className="horizontal-line" />
      <div className="tabs-container">
        <TabMedia />
      </div>
    </div>
  );
};

export default Profile;
