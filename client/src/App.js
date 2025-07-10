// frontend/src/App.js

import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import Navbar from './components/Navbar'; // Import Navbar
import HomePage from './pages/HomePage'; // Import HomePage
import LoginPage from './pages/LoginPage'; // Import LoginPage
import SignupPage from './pages/SignupPage'; // Import SignupPage
import ProfilePage from './pages/ProfilePage'; // Import ProfilePage
import SavedCitiesPage from './pages/SavedCitiesPage'; // Import SavedCitiesPage
import './App.css'; // Global app styles

function App() {
  return (
    // Wrap the entire application with AuthProvider to make auth context available
    <AuthProvider>
      <Router>
        <Navbar /> {/* Navbar will be visible on all pages */}
        <div className="container"> {/* A container for page content */}
          <Routes>
            {/* Define routes for different pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/saved-cities" element={<SavedCitiesPage />} />
            {/* You can add a catch-all route for 404 Not Found if desired */}
            {/* <Route path="*" element={<div>404 Not Found</div>} /> */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;