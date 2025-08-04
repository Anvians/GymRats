import React, { useEffect, useState, useRef, useCallback } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import PostCard from "../PostCard";
import PostSkeleton from "../PostSkeleton";
import Recommendation from "../Recommendation/Location_mutual";
import "./index.css";

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [userData, setUserData] = useState(null);
    const [savedPostIds, setSavedPostIds] = useState(new Set());
    
    // --- States for infinite scroll ---
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [hasNextPage, setHasNextPage] = useState(true);
    
    const navigate = useNavigate();

    // --- Fetch feed data ---
    useEffect(() => {
        const token = Cookies.get("auth_token");
        if (!token) {
            navigate("/");
            return;
        }

        // Using AbortController to clean up the request if the component unmounts
        const controller = new AbortController();

        const fetchFeed = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/api/posts/feed?page=${page}&limit=10`, {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal, // Pass the signal to the request
                });

                if (response.data.success) {
                    setUserData(response.data.user);
                    
                    // ✅ **OPTIMIZED STATE UPDATE**
                    // Replace posts on page 1, append on subsequent pages
                    setPosts(prevPosts => {
                        return page === 1 ? response.data.posts : [...prevPosts, ...response.data.posts];
                    });
                    
                    setSavedPostIds(new Set(response.data.savedPostIds));
                    setHasNextPage(response.data.pagination.hasNextPage);
                }
            } catch (err) {
                // Don't log an error if the request was intentionally aborted
                if (axios.isCancel(err)) {
                    console.log("Request canceled:", err.message);
                } else {
                    console.error("Error fetching data:", err);
                }
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if there are more pages to load
        if (hasNextPage || page === 1) {
             fetchFeed();
        }

        // Cleanup function: aborts the fetch if the component unmounts
        return () => {
            controller.abort();
        };
    }, [page, navigate]); // Effect runs when 'page' changes

    // --- Intersection Observer Logic ---
    const observer = useRef();
    const lastPostElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasNextPage]);

    // --- Event Handlers (assumed to be implemented correctly) ---
    const handleLikeUpdate = (postId, updatedLikes) => {
        setPosts(prevPosts =>
            prevPosts.map(p => (p._id === postId ? { ...p, likes: updatedLikes } : p))
        );
    };

    const handleSaveToggle = (postId, isCurrentlySaved) => {
        const newSavedPostIds = new Set(savedPostIds);
        if (isCurrentlySaved) {
            newSavedPostIds.delete(postId);
        } else {
            newSavedPostIds.add(postId);
        }
        setSavedPostIds(newSavedPostIds);
    };
    
    return (
        <div className="home-layout">
            <main className="feed-container">
                {posts.map((post, index) => {
                    // Attach the ref to the last post to trigger infinite scroll
                    if (posts.length === index + 1) {
                        return (
                            <div ref={lastPostElementRef} key={post._id}>
                                <PostCard
                                    post={post}
                                    currentUser={userData}
                                    onLikeUpdate={handleLikeUpdate}
                                    isSaved={savedPostIds.has(post._id)}
                                    onSaveToggle={handleSaveToggle}
                                />
                            </div>
                        );
                    } else {
                        return (
                            <PostCard
                                key={post._id}
                                post={post}
                                currentUser={userData}
                                onLikeUpdate={handleLikeUpdate}
                                isSaved={savedPostIds.has(post._id)}
                                onSaveToggle={handleSaveToggle}
                            />
                        );
                    }
                })}
                {/* Show loading skeletons at the bottom */}
                {loading && <PostSkeleton />}
                {!hasNextPage && posts.length > 0 && (
                    <div className="feed-end-message">You've reached the end! 👋</div>
                )}
            </main>
            {/* You can add your Recommendation component back here if needed */}
        </div>
    );
};

export default Home;