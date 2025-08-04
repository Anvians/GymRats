import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
    return (
        <div className="not-found-container">
            <h1>404</h1>
            <h2>Page Not Found</h2>
            <p>Sorry, the gym rat you are looking for has gone home.</p>
            <Link to="/home" className="not-found-link">
                Return to the Feed
            </Link>
        </div>
    );
};

export default NotFound;