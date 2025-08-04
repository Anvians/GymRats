import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

/**
 * A component to protect routes that require authentication.
 * It checks for the presence of an 'auth_token' cookie.
 */
const PrivateRoute = () => {
    // Check if the authentication token exists. The `!!` converts the value to a boolean.
    const isAuthenticated = !!Cookies.get('auth_token');

    // If the user is authenticated, render the nested child routes using <Outlet />.
    // Otherwise, redirect the user to the /login page, replacing the current history entry.
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;