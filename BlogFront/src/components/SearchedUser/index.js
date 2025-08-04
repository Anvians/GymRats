import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./index.css";


import Cookies from "js-cookie";
import TabMedia from "../Tabs/TabMedia";
import TabPosts from "../Tabs/TabPosts";


const SearchedUser = () => {
  const location = useLocation();
  const { userList } = location.state || {}; // Retrieve userList from state

  const [activeTab, setActiveTab] = useState("Posts");
  const [following, setfollowing] = useState(false)

  const userPostsData = async () => {
    const token = Cookies.get("auth_token");
    if (!token) {
      console.warn("No authentication token found");
      return;
    }

    try {
      console.log("Fetching user data...");
      const response = await fetch("http://localhost:5000/media", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        // setUserData(data.user);
      } else {
        console.error("Failed to fetch user:", data.message);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  const followUser = async () => {
    const token = Cookies.get("auth_token");
    if (!token) {
      console.warn("No authentication token found");
      return;
    }

    try {
      console.log("Following user...");
      const response = await fetch("http://localhost:5000/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ followingId: userList._id}),
    });

      const data = await response.json();
      if (data.success) {
        console.log("Successfully followed user");
        window.location.reload()
        
      } else {
        console.error("Failed to follow user:", data.message);
        
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  }

  const isfollowing = async () => {
    const token = Cookies.get('auth_token');
    
    // Ensure the Authorization header includes a space between 'Bearer' and the token
    const request = await fetch(`http://localhost:5000/following/check/${userList._id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`  // Note the space after 'Bearer'
        }
    });

    const data = await request.json();
    console.log('data for following', data);
    if(data.success){
      setfollowing(true)
    }
}

  const unfollow = async() =>{
    

    const token = Cookies.get('auth_token')
    try{
    const response = await fetch('http://localhost:5000/unfollow', {
      method : 'POST',
      headers:{
        "Content-Type" : "application/json",
        Authorization : `Bearer ${token}`
        
      },
      body : JSON.stringify({followingId : userList._id})
    })
    const data = await response.json()
    if(data.success){
      console.log('Unfollowed successfully')
      window.location.reload()
    }
    else{
      console.log('Failed')
    }
  }catch(e){
    console.error('Something Error', e)
  }

  }



  useEffect(() => {
    console.log(userList);
    userPostsData(); // Fetch additional user data when component mounts
    isfollowing()
  }, [userList]);

  return (
    <div className="user-profile">
      <div>
        {userList ? (
          <>
            <img src={userList.media} alt="User Avatar" className="profile-image" />
            <h2 className="user-name">
              {userList.firstname} {userList.lastname}
            </h2>
            <p className="user-email">@{userList.username}</p>
            <p className="user-email">{userList.bio}</p>
          </>
        ) : (
          <p>Loading user data...</p>
        )}

        
        {following ? (
          <button  onClick={unfollow }>Unfollow</button>
        ) : (
          <button onClick={followUser}>Follow</button>
        )}
        
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button
            className={activeTab === "Posts" ? "active" : ""}
            onClick={() => setActiveTab("Posts")}
          >

          
            Posts
          </button>
          <button
            className={activeTab === "Media" ? "active" : ""}
            onClick={() => setActiveTab("Media")}
          >
            Media
          </button>
        </div>

        <div>
          {activeTab === "Posts" && <div>{<TabPosts />}</div>}
          {activeTab === "Media" && <div>{<TabMedia />}</div>}
        </div>
      </div>
    </div>
  

  )};

export default SearchedUser;


