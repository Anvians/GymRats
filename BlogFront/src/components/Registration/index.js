import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GiMuscleUp } from 'react-icons/gi';
import { FaUser, FaEnvelope, FaLock, FaCheckCircle } from 'react-icons/fa';
import './index.css'; // New styles

const Registration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.firstname) errors.firstname = "First name is required.";
        if (!formData.username) errors.username = "Username is required.";
        if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = "A valid email is required.";
        if (formData.password.length < 6) errors.password = "Password must be at least 6 characters.";
        if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match.";
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
                firstname: formData.firstname,
                lastname: formData.lastname,
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            const message = err.response?.data?.message || "Registration failed. Please try again.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // Helper to display validation errors
    const renderError = (field) => validationErrors[field] && <span className="validation-error">{validationErrors[field]}</span>;

    return (
        <div className="register-page">
            <div className="register-panel">
                <div className="branding-section">
                    <div className="logo">
                        <GiMuscleUp size={60} />
                        <h1>Gym Rat</h1>
                    </div>
                    <h2>Join the Community</h2>
                    <p>Create your account to start your fitness journey with us.</p>
                </div>

                <div className="form-section">
                    <form onSubmit={handleSubmit} noValidate>
                        <h3>Create Your Account</h3>
                        
                        {error && <p className="error-message">{error}</p>}
                        {success && <p className="success-message"><FaCheckCircle/> {success}</p>}

                        <div className="input-row">
                            <div className="input-group half">
                                <input type="text" name="firstname" placeholder="First Name" onChange={handleChange} disabled={loading} />
                                {renderError('firstname')}
                            </div>
                            <div className="input-group half">
                                <input type="text" name="lastname" placeholder="Last Name (Optional)" onChange={handleChange} disabled={loading} />
                            </div>
                        </div>

                        <div className="input-group">
                            <FaUser className="input-icon" />
                            <input type="text" name="username" placeholder="Username" onChange={handleChange} disabled={loading} />
                            {renderError('username')}
                        </div>

                        <div className="input-group">
                            <FaEnvelope className="input-icon" />
                            <input type="email" name="email" placeholder="Email Address" onChange={handleChange} disabled={loading} />
                            {renderError('email')}
                        </div>

                        <div className="input-group">
                            <FaLock className="input-icon" />
                            <input type="password" name="password" placeholder="Password" onChange={handleChange} disabled={loading} />
                            {renderError('password')}
                        </div>

                        <div className="input-group">
                            <FaLock className="input-icon" />
                            <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} disabled={loading} />
                            {renderError('confirmPassword')}
                        </div>

                        <button type="submit" className="register-button" disabled={loading || success}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                        
                        <div className="form-footer">
                            <p>Already have an account? <Link to="/login">Log In</Link></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Registration;