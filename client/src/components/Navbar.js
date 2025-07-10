// frontend/src/components/Navbar.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">WeatherWise</Link>
            </div>
            <ul className="navbar-links">
                <li>
                    <Link to="/">Current Weather</Link>
                </li>
                {isAuthenticated && (
                    <li>
                        <Link to="/saved-cities">Saved Cities</Link>
                    </li>
                )}
            </ul>
            <div className="navbar-auth">
                {isAuthenticated ? (
                    <>
                        <span className="navbar-user-email">Hello, {user?.email || 'User'}</span>
                        {/* REMOVED: <Link to="/profile" className="profile-button">Profile</Link> */}
                        <button onClick={handleLogout} className="logout-button">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="login-button">Login</Link>
                        <Link to="/signup" className="signup-button">Signup</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;