import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import './index.css'; // New CSS file
import { FaUser, FaSignature, FaSave } from 'react-icons/fa';

const EditProfile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        bio: '',
    });
    const [currentDp, setCurrentDp] = useState('');
    const [newDpFile, setNewDpFile] = useState(null);
    const [previewDp, setPreviewDp] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Fetch current user data to pre-fill the form
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = Cookies.get('auth_token');
                const response = await axios.get('http://localhost:5000/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const { firstname, lastname, bio, dp } = response.data;
                setFormData({ firstname, lastname: lastname || '', bio: bio || '' });
                setCurrentDp(dp);
            } catch (error) {
                console.error("Failed to fetch user data", error);
            }
        };
        fetchUserData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewDpFile(file);
            setPreviewDp(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const updatePayload = new FormData();
        updatePayload.append('firstname', formData.firstname);
        updatePayload.append('lastname', formData.lastname);
        updatePayload.append('bio', formData.bio);
        if (newDpFile) {
            updatePayload.append('dp', newDpFile);
        }

        try {
            const token = Cookies.get('auth_token');
            await axios.put('http://localhost:5000/api/users/profile/edit', updatePayload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            setMessage('Profile updated successfully!');
            setTimeout(() => navigate('/profile'), 1500); // Redirect after success
        } catch (error) {
            setMessage('Failed to update profile. Please try again.');
            console.error("Update profile error", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="edit-profile-container">
            <form className="edit-profile-form" onSubmit={handleSubmit}>
                <h2>Edit Your Profile</h2>
                
                <div className="dp-uploader">
                    <label htmlFor="dp-input">
                        <img src={previewDp || currentDp || 'https://via.placeholder.com/150'} alt="Profile" className="profile-picture-preview" />
                        <div className="dp-overlay">Click to change</div>
                    </label>
                    <input id="dp-input" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </div>

                <div className="input-group">
                    <label htmlFor="firstname"><FaUser /> First Name</label>
                    <input type="text" id="firstname" name="firstname" value={formData.firstname} onChange={handleChange} required />
                </div>

                <div className="input-group">
                    <label htmlFor="lastname"><FaUser /> Last Name</label>
                    <input type="text" id="lastname" name="lastname" value={formData.lastname} onChange={handleChange} />
                </div>

                <div className="input-group">
                    <label htmlFor="bio"><FaSignature /> Bio</label>
                    <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows="4"></textarea>
                </div>
                
                {message && <p className="status-message">{message}</p>}

                <button type="submit" className="save-button" disabled={loading}>
                    <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

export default EditProfile;