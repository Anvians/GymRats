import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import './index.css'; // New CSS file
import { formatDistanceToNow } from 'date-fns';

const SinglePost = () => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const token = Cookies.get('auth_token');
                const response = await axios.get(`http://localhost:5000/api/posts/${postId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPost(response.data.post);
            } catch (err) {
                setError('Could not load post. It may have been deleted.');
                console.error("Fetch post error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [postId]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const token = Cookies.get('auth_token');
            const response = await axios.post(`http://localhost:5000/api/posts/${postId}/comments`, 
                { text: newComment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Add the new comment to the state to update UI instantly
            setPost(prevPost => ({
                ...prevPost,
                comments: [...prevPost.comments, response.data]
            }));
            setNewComment(''); // Clear input
        } catch (error) {
            console.error("Failed to post comment:", error);
        }
    };

    if (loading) return <div className="status-container">Loading Post...</div>;
    if (error) return <div className="status-container error">{error}</div>;

    return (
        <div className="single-post-page">
            <div className="single-post-container">
                {/* Left Panel: Media */}
                <div className="media-panel">
                    {post.mediaUrl.endsWith('.mp4') ? (
                        <video src={post.mediaUrl} controls autoPlay loop muted />
                    ) : (
                        <img src={post.mediaUrl} alt="Post content" />
                    )}
                </div>

                {/* Right Panel: Details & Comments */}
                <div className="details-panel">
                    <header className="post-author-header">
                        <Link to={`/profile/${post.user.username}`}>
                            <img src={post.user.dp} alt={post.user.username} />
                            <span>{post.user.username}</span>
                        </Link>
                    </header>

                    <div className="comments-section">
                        {/* The post caption shown as the first "comment" */}
                        <div className="comment-item">
                            <img src={post.user.dp} alt={post.user.username} />
                            <div className="comment-body">
                                <p><strong>{post.user.username}</strong> {post.caption}</p>
                                <span className="timestamp">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                            </div>
                        </div>

                        {/* Map over the actual comments */}
                        {post.comments.map(comment => (
                             <div className="comment-item" key={comment._id}>
                                <img src={comment.user.dp} alt={comment.user.username} />
                                <div className="comment-body">
                                    <p><strong>{comment.user.username}</strong> {comment.text}</p>
                                    <span className="timestamp">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <form className="comment-form" onSubmit={handleCommentSubmit}>
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button type="submit" disabled={!newComment.trim()}>Post</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SinglePost;