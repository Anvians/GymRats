// components/CreatePostModal.js

import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ReactTags } from 'react-tag-autocomplete';
import { FaTimes, FaFileUpload, FaGlobe, FaUserFriends, FaLock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import './index.css'; // We will update this file

const CreatePostModal = ({ closeModal }) => {
    // ... (all your existing state and logic remains the same) ...
    // No changes needed for useState, useEffect, onDrop, onTagDelete, onTagAdd, handleUpload
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [caption, setCaption] = useState('');
    const [tags, setTags] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [privacy, setPrivacy] = useState('public');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        const fetchTagSuggestions = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/posts/tags");
                setSuggestions(response.data.map(tag => ({ value: tag, label: tag })));
            } catch (error) { console.error("Error fetching tag suggestions:", error); }
        };
        fetchTagSuggestions();
    }, []);

    const onDrop = useCallback(acceptedFiles => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [], 'video/*': [] }, multiple: false });
    const onTagDelete = (tagIndex) => setTags(tags.filter((_, i) => i !== tagIndex));
    const onTagAdd = (newTag) => setTags([...tags, newTag]);

    const handleUpload = async () => {
        if (!file) { setError("Please select a file to upload."); return; }
        setError('');
        setLoading(true);
        const formData = new FormData();
        formData.append("media", file);
        formData.append("caption", caption);
        formData.append("privacy", privacy);
        formData.append("tags", JSON.stringify(tags.map(t => t.value)));
        try {
            const token = Cookies.get("auth_token");
            await axios.post("http://localhost:5000/api/posts", formData, {
                headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
            });
            setTimeout(() => closeModal(), 1000);
        } catch (err) {
            const message = err.response?.data?.message || "An error occurred while uploading.";
            setError(message);
            setLoading(false);
            setUploadProgress(0);
        }
    };


    return (
        <div className="modal-overlay-fade-in" onClick={closeModal}>
            <div className="create-post-modal-scale-up" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h3>Create New Post</h3>
                    <button className="close-btn" onClick={closeModal}><FaTimes /></button>
                </header>
                
                <div className="modal-body">
                    {/* Left Panel */}
                    <div className="file-panel">
                        {!preview ? (
                            <div {...getRootProps({ className: `dropzone ${isDragActive ? 'active' : ''}` })}>
                                <input {...getInputProps()} />
                                <div className="dropzone-content">
                                    <FaFileUpload className="dropzone-icon" />
                                    <p>Drag & drop media here, or click to select</p>
                                    <span>Supports Images & Videos</span>
                                </div>
                            </div>
                        ) : (
                            <div className="preview-container">
                                {file.type.startsWith('image/') ? (
                                    <img src={preview} alt="Preview" className="media-preview" />
                                ) : (
                                    <video src={preview} controls className="media-preview" />
                                )}
                                <button className="change-file-btn" onClick={() => { setFile(null); setPreview(null); }}>Change File</button>
                            </div>
                        )}
                    </div>

                    {/* Right Panel */}
                    <div className="details-panel">
                        <textarea
                            className="caption-input"
                            placeholder="Write a caption..."
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                        />
                        
                        <div className="tags-input-container">
                             <ReactTags
                                tags={tags}
                                suggestions={suggestions}
                                onDelete={onTagDelete}
                                onAddition={onTagAdd}
                                placeholderText="Add tags... (#fitness, #gym)"
                                allowNew
                               
                            />
                        </div>

                        <div className="privacy-options">
                            <label>Who can see this?</label>
                            <div className="radio-group">
                                <button onClick={() => setPrivacy('public')} className={`privacy-btn ${privacy === 'public' ? 'active' : ''}`}><FaGlobe/> Public</button>
                                <button onClick={() => setPrivacy('friends')} className={`privacy-btn ${privacy === 'friends' ? 'active' : ''}`}><FaUserFriends/> Friends</button>
                                <button onClick={() => setPrivacy('private')} className={`privacy-btn ${privacy === 'private' ? 'active' : ''}`}><FaLock/> Private</button>
                            </div>
                        </div>

                        {error && <p className="error-message"><FaExclamationTriangle/> {error}</p>}

                        <div className="modal-actions">
                            {loading && (
                                <div className="progress-bar">
                                    <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}>
                                        {uploadProgress > 0 && `${uploadProgress}%`}
                                    </div>
                                </div>
                            )}
                            <button className="post-btn" onClick={handleUpload} disabled={loading}>
                                {uploadProgress === 100 ? <><FaCheckCircle/> Shared!</> : (loading ? 'Sharing...' : 'Share Post')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;