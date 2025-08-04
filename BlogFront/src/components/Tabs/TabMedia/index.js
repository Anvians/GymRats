import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import "./index.css";
const TabMedia = () => {
  const [userPost, setUserPost] = useState([]); //  Initialize as an array
  const token = Cookies.get("auth_token");

  // console.log('userPost', userPost[0].media)
  const userData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/media`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      // console.log("User Data in profile:", data.posts);
      if (data.success) {
        setUserPost(data.posts || []); // Ensure it's always an array
        console.log(data.posts)
      } else {
        console.log("Error fetching data");
      }
    } catch (error) {
      console.log("Error Fetching data", error);
    }
  };

  useEffect(() => {
    userData();
  }, []);

  const [hoveredPostId, setHoveredPostId] = useState(null);

  return (
    <div>
      <div className="post-tab-content">
        {Array.isArray(userPost) && userPost.length > 0 ? (
          userPost.map((post) => (
            <div className="post-content" key={post._id}>
              {post.media && (
                <div
                  style={{ position: "relative", display: "inline-block" }}
                  onMouseEnter={() => setHoveredPostId(post._id)}
                  onMouseLeave={() => setHoveredPostId(null)}
                >
                  <img
                    src={post.media}
                    crossOrigin="anonymous"
                    className="media-image"
                    alt="User Post"
                  />
                  {hoveredPostId === post._id && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "rgba(0,0,0,0.7)",
                        color: "#fff",
                        padding: "4px 12px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        pointerEvents: "none",
                      }}
                    >
                      Likes: {post.likes.length}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No posts found.</p>
        )}
      </div>
    </div>
  );
};

export default TabMedia;


