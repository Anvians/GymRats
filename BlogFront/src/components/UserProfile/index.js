import React, { useState } from 'react';
import './index.css';


const UserProfile = () => {
    const [name, setName] = useState('');
    const [image, setImage] = useState(null);
    const [videos, setVideos] = useState([]);

    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    const handleImageChange = (e) => {
        setImage(URL.createObjectURL(e.target.files[0]));
    };

    const handleVideoChange = (e) => {
        const files = Array.from(e.target.files);
        const videoUrls = files.map(file => URL.createObjectURL(file));
        setVideos(videoUrls);
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-info">
                    <h2>{name || 'Your Name'}</h2>
                    <p>Edit your profile information</p>
                </div>
                <div>
                    <button className="edit-button">Edit</button>
                </div>
            </div>
            <div className="profile-content">
                <div>
                    <label>Name:</label>
                    <input type="text" value={name} onChange={handleNameChange} />
                </div>
                <div>
                    <label>Profile Image:</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    {image && <img src={image} alt="Profile" className="profile-image" />}
                </div>
                <div>
                    <label>Videos:</label>
                    <input type="file" accept="video/*" multiple onChange={handleVideoChange} />
                    <div className="videos">
                        {videos.map((video, index) => (
                            <div key={index} className="video">
                                <video src={video} controls width="100%" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;