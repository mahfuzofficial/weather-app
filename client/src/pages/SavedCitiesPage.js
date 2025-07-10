// frontend/src/pages/SavedCitiesPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import auth context
import './SavedCitiesPage.css'; // Styling for SavedCitiesPage

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Helper to format date for forecast
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

// Function to get icon URL from OpenWeatherMap
const getIconUrl = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

function SavedCitiesPage() {
    const { isAuthenticated, loading: authLoading } = useAuth(); // Get auth state
    const [savedCities, setSavedCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Redirect if not authenticated and auth state is loaded
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Fetch saved cities when component mounts or auth state changes
    useEffect(() => {
        const fetchCities = async () => {
            if (!isAuthenticated) return; // Don't fetch if not authenticated

            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`${API_BASE_URL}/weather`);
                setSavedCities(response.data);
            } catch (err) {
                console.error('Error fetching saved cities:', err);
                setError('Could not load saved cities. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) { // Only fetch if authenticated
            fetchCities();
        }
    }, [isAuthenticated]); // Re-fetch if authentication status changes

    // Handle deleting a city
    const handleDeleteCity = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/weather/${id}`);
            // Update state to remove the deleted city without re-fetching all
            setSavedCities(prevCities => prevCities.filter(city => city._id !== id));
            setError('');
        } catch (err) {
            console.error('Error deleting city:', err);
            setError('Failed to delete city.');
        }
    };

    if (authLoading || !isAuthenticated) {
        return <div className="loading-full-page">Loading...</div>; // Show loading while auth state is determined
    }

    return (
        <div className="saved-cities-page">
            <h2>Your Saved Cities</h2>
            {loading && <p className="message loading">Loading saved cities...</p>}
            {error && <p className="message error">{error}</p>}

            {savedCities.length === 0 && !loading && !error ? (
                <p className="no-cities-message">You haven't saved any cities yet. Search and save them from the Current Weather page!</p>
            ) : (
                <div className="cities-grid">
                    {savedCities.map((city) => (
                        <div key={city._id} className="city-card">
                            <div className="city-header">
                                <h3>{city.name}</h3>
                                <button onClick={() => handleDeleteCity(city._id)} className="delete-city-button">
                                    Delete
                                </button>
                            </div>

                            {/* Current Weather for Saved City */}
                            <div className="current-saved-weather">
                                <img src={getIconUrl(city.currentWeatherData.icon)} alt={city.currentWeatherData.description} className="weather-icon-small" />
                                <p className="temp-main">{city.currentWeatherData.temperature}°C</p>
                                <p className="desc-main">{city.currentWeatherData.description}</p>
                                <p className="details-main">Humidity: {city.currentWeatherData.humidity}% | Wind: {city.currentWeatherData.windSpeed} m/s</p>
                            </div>

                            {/* 5-Day Forecast for Saved City */}
                            {city.forecastData && city.forecastData.length > 0 && (
                                <div className="saved-forecast-section">
                                    <h4>5-Day Forecast</h4>
                                    <div className="saved-forecast-grid">
                                        {city.forecastData.map((day, index) => (
                                            <div key={index} className="saved-forecast-day-card">
                                                <p className="forecast-date-small">{formatDate(day.date)}</p>
                                                <img src={getIconUrl(day.icon)} alt={day.description} className="forecast-icon-small" />
                                                <p className="forecast-temp-small">{Math.round(day.temp_min)}°C / {Math.round(day.temp_max)}°C</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SavedCitiesPage;