// frontend/src/pages/ProfilePage.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import our auth context
import './ProfilePage.css'; // Styling for ProfilePage

function ProfilePage() {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect if not authenticated
    if (!isAuthenticated) {
        navigate('/login');
        return null; // Or a loading spinner/message
    }

    const handleLogout = () => {
        logout(); // Call logout from context
        navigate('/login'); // Redirect to login page after logout
    };

    const handleEditProfile = () => {
        // For a beginner project, this can be a placeholder.
        // In a real app, this would navigate to an "Edit Profile" form.
        alert('Edit Profile functionality is not yet implemented.');
        // navigate('/edit-profile');
    };

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2>User Profile</h2>
                <div className="profile-info">
                    <p><strong>Email:</strong> {user?.email}</p>
                    {/* Add other user details here if available, e.g., name */}
                </div>
                <div className="profile-actions">
                    <button onClick={handleEditProfile} className="edit-profile-button">
                        Edit Profile
                    </button>
                    <button onClick={handleLogout} className="logout-profile-button">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;