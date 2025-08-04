import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios"; // Using axios for consistency
import { GiMuscleUp } from 'react-icons/gi'; // Logo icon
import { FaUser, FaLock } from 'react-icons/fa'; // Form icons
import './index.css'; // New styles


const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect if already logged in
    useEffect(() => {
        if (Cookies.get('auth_token')) {
            navigate('/home'); // Redirect to home feed instead of profile
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                username,
                password
            });

            if (response.data.token) {
                Cookies.set('auth_token', response.data.token, { expires: 7, secure: true, sameSite: 'Strict' });
                // We don't need to store user data in localStorage; we can fetch it when needed.
                navigate('/home');
            }
        } catch (err) {
            // Use the error message from the backend if available, otherwise show a generic one
            const message = err.response?.data?.message || "Login failed. Please check your credentials.";
            setError(message);
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-panel">
                {/* Left Side: Branding & Welcome Message */}
                <div className="branding-section">
                    <div className="logo">
                        <GiMuscleUp size={60} />
                        <h1>Gym Rat</h1>
                    </div>
                    <h2>Welcome Back!</h2>
                    <p>Log in to track your progress and connect with the community.</p>
                </div>

                {/* Right Side: Login Form */}
                <div className="form-section">
                    <form onSubmit={handleSubmit} noValidate className="form-class">
                        <h3>Account Login</h3>
                        
                        <div className="input-group">
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                id="username"
                                name="username"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="input-group">
                            <FaLock className="input-icon" />
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        {error && <p className="error-message">{error}</p>}
                        
                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? 'Logging In...' : 'Log In'}
                        </button>
                        
                        <div className="form-footer">
                            <Link to="/forgot-password">Forgot Password?</Link>
                            <p>
                                Don't have an account? <Link to="/register">Sign Up</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;