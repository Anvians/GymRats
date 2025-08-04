import axios from "axios";
import Cookies from "js-cookie";
import React, { useState, useEffect } from "react";
import "./index.css";
const Location_mutual = () => {
  const [recommendation, setRecommendation] = useState(null);
  const [userId, setUserId] = useState(1); // Example: set a user ID
  const [location, setLocation] = useState(null);
  const [nearUser, setNearUser] = useState(null);
  const [mutualFriends, setMutualFriends] = useState([]);
  const token = Cookies.get("auth_token");
  // Simulate getting mutual friends
  const getMutualFriends = () => {
    return [
      { id: 1, name: "John" },
      { id: 2, name: "Sara" },
    ];
  };

  // Get user's current geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },

        (error) => console.log(error)
      );
    }
  }, []);

  // get the recommended userId from the backend
  const getRecommendedUserId = async () => {
    const response = await fetch(
      "http://localhost:5000/api/recommendNearbyUsers",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    if (data.success) {
      setNearUser(data.recommendations);
    } else {
      console.log("Error fetching recommended userId:", data.message);
    }
  };
  useEffect(() => {
    getRecommendedUserId(); // Fetch recommended userId when component mounts
  }, []);

  const storeLocation = async () => {
    if (location) {
      const response = await fetch("http://localhost:5000/api/storeLocation", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          location,
        }),
      });

      const data = await response.json();
      console.log("Location stored:", data);
    }
  };
  useEffect(() => {
    if (location) {
      storeLocation(); // Store location when it's available
    }
  }, [location]);

  // // Send location and mutual friends to backend for recommendation
  // const handleGetRecommendation = async () => {
  //   if (location) {
  //     const mutualFriendsList = getMutualFriends();

  //     const response = await fetch(
  //       "http://localhost:5000/api/getRecommendations",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           location,
  //           mutualFriends: mutualFriendsList,
  //         }),
  //       }
  //     );

  //     const data = await response.json();
  //     console.log("data", data);
  //     setRecommendation(data.recommendation);
  //   }
  // };

  return (
    <div className="recommendation-container">
      <h1 className="recommend-typeh1">People near you</h1>
      {nearUser && (
        <div>
          <ul>
            {nearUser.map((user) => (
              <li key={user.id}>
                <div className="user_info">
                  <img
                    className="user_dp"
                    src={user.dp}
                    alt="User Avatar"
                    crossorigin="anonymous"
                  />
                  <div>
                  <p className="username"> @{user.username}</p>
                  <p >
                    {user.firstname.charAt(0).toUpperCase() +
                      user.firstname.slice(1)}
                    {user.lastname.charAt(0).toUpperCase() +
                      user.lastname.slice(1)}
                  </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {recommendation && <div>{recommendation}</div>}


      <h1 className="recommend-typeh1">people you might follow</h1>

      <h1 className="recommend-typeh1">Trending Accounts</h1>
    </div>
  );
};

export default Location_mutual;
