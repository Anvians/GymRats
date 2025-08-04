import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './index.css'; 
import gymImage from './gym_image.jpg'; 
const UnloggedHome = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = Cookies.get('auth_token');
        if (token) {
            navigate('/home');
        }
    }, [navigate]);

    return (
        <div >
            <h1>Home</h1>
            <img src={gymImage} alt="Gym" className="home-image" />
            <div className="home-content">
                <h2>Welcome to Our Fitness Community</h2>
                <p>Join us to explore a world of fitness, health, and wellness.</p>
                <p>Sign up or log in to get started!</p>
                <button onClick={() => navigate('/login')} className="btn btn-primary">Login</button>
                <button onClick={() => navigate('/register')} className="btn btn-secondary">Register</button>
                </div>
        </div>
    );
};

export default UnloggedHome;