// frontend/src/context/AuthContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create the AuthContext
const AuthContext = createContext();

// Base URL for our backend API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// AuthProvider component to wrap our application and provide auth context
export const AuthProvider = ({ children }) => {
    // State to hold user information and authentication token
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true); // To indicate if auth state is being loaded

    // Effect to run once on component mount to check for existing token
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                // If a token exists, try to fetch user profile to validate it
                try {
                    // Set authorization header for all subsequent axios requests
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const response = await axios.get(`${API_BASE_URL}/auth/profile`);
                    setUser(response.data); // Set user data if token is valid
                } catch (error) {
                    console.error('Token invalid or expired:', error);
                    logout(); // If token is invalid, log out the user
                }
            }
            setLoading(false); // Auth state loaded
        };
        loadUser();
    }, [token]); // Re-run if token changes

    // Function to handle user login
    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
            const { token, _id, email: userEmail } = response.data;

            localStorage.setItem('token', token); // Store token in local storage
            setToken(token); // Update token state
            setUser({ _id, email: userEmail }); // Set user state

            // Set default authorization header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setLoading(false);
            return { success: true };
        } catch (error) {
            setLoading(false);
            console.error('Login error:', error.response?.data?.message || error.message);
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    // Function to handle user registration
    const register = async (email, password) => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, { email, password });
            const { token, _id, email: userEmail } = response.data;

            localStorage.setItem('token', token);
            setToken(token);
            setUser({ _id, email: userEmail });

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setLoading(false);
            return { success: true };
        } catch (error) {
            setLoading(false);
            console.error('Registration error:', error.response?.data?.message || error.message);
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    // Function to handle user logout
    const logout = () => {
        localStorage.removeItem('token'); // Remove token from local storage
        setToken(null); // Clear token state
        setUser(null); // Clear user state
        delete axios.defaults.headers.common['Authorization']; // Remove auth header
    };

    // Value provided by the context to its consumers
    const authContextValue = {
        user,
        token,
        isAuthenticated: !!token, // True if token exists
        loading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to easily consume the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};