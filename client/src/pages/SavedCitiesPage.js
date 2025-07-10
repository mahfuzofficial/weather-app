// frontend/src/pages/SavedCitiesPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SavedCitiesPage.css'; // Main page styling
import './ForecastModal.css'; // Styling for the modal

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

// ForecastModal Component (defined here for convenience, but could be in its own file)
const ForecastModal = ({ forecastData, cityName, onClose, getIconUrl, formatDate }) => {
    if (!forecastData || forecastData.length === 0) {
        return null; // Don't render modal if no data
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="forecast-modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose}>&times;</button>
                <h3>5-Day Forecast for {cityName}</h3>
                <div className="modal-forecast-grid">
                    {forecastData.map((day, index) => (
                        <div key={index} className="modal-forecast-day-card">
                            <p className="forecast-date-small">{formatDate(day.date)}</p>
                            <img src={getIconUrl(day.icon)} alt={day.description} className="forecast-icon-small" />
                            <p className="forecast-temp-small">{Math.round(day.temp_min)}°C / {Math.round(day.temp_max)}°C</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


function SavedCitiesPage() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [savedCities, setSavedCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForecastModal, setShowForecastModal] = useState(false);
    const [currentForecastModalData, setCurrentForecastModalData] = useState({ forecast: [], name: '' });
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        const fetchCities = async () => {
            if (!isAuthenticated) return;

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

        if (isAuthenticated) {
            fetchCities();
        }
    }, [isAuthenticated]);

    const handleDeleteCity = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/weather/${id}`);
            setSavedCities(prevCities => prevCities.filter(city => city._id !== id));
            setError('');
        } catch (err) {
            console.error('Error deleting city:', err);
            setError('Failed to delete city.');
        }
    };

    // Function to open the forecast modal
    const openForecastModal = (forecastData, cityName) => {
        setCurrentForecastModalData({ forecast: forecastData, name: cityName });
        setShowForecastModal(true);
    };

    // Function to close the forecast modal
    const closeForecastModal = () => {
        setShowForecastModal(false);
        setCurrentForecastModalData({ forecast: [], name: '' }); // Clear data on close
    };

    if (authLoading || !isAuthenticated) {
        return <div className="loading-full-page">Loading...</div>;
    }

    return (
        <div className="saved-cities-page">
            <h2>Your Saved Cities</h2>
            {loading && <p className="message loading">Loading saved cities...</p>}
            {error && <p className="message error">{error}</p>}

            {savedCities.length === 0 && !loading && !error ? (
                <p className="no-cities-message">You haven't saved any cities yet. Search and save them from the Current Weather page!</p>
            ) : (
                // This div is the container for all your city cards
                // It needs the 'cities-grid' class for the CSS grid layout to apply
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

                            {/* Button to open the forecast modal */}
                            {city.forecastData && city.forecastData.length > 0 && (
                                <button
                                    className="view-forecast-button"
                                    onClick={() => openForecastModal(city.forecastData, city.name)}
                                >
                                    {/* Optional: Font Awesome icon */}
                                    {/* Make sure you have Font Awesome installed and imported */}
                                    <i className="fas fa-calendar-alt"></i>
                                    View 5-Day Forecast
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Render the ForecastModal conditionally */}
            {showForecastModal && (
                <ForecastModal
                    forecastData={currentForecastModalData.forecast}
                    cityName={currentForecastModalData.name}
                    onClose={closeForecastModal}
                    getIconUrl={getIconUrl}
                    formatDate={formatDate}
                />
            )}
        </div>
    );
}

export default SavedCitiesPage;