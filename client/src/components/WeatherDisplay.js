// frontend/src/components/WeatherDisplay.js

import React from 'react';
import './WeatherDisplay.css';

// Helper to format date for forecast
const formatDate = (dateString) => {
    const date = new Date(dateString);
    // Use 'en-IN' for India locale if you prefer, or keep 'en-US'
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

// Function to get icon URL from OpenWeatherMap
const getIconUrl = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

// Component to display weather information
function WeatherDisplay({ currentWeatherData, forecastData }) {
    if (!currentWeatherData) {
        return null; // Don't render if no data
    }

    return (
        <div className="weather-display-container">
            {/* New wrapper for horizontal layout */}
            <div className="weather-content-wrapper">
                {/* Current Weather Section */}
                <div className="current-weather-card">
                    <h2>{currentWeatherData.city}</h2>
                    <div className="current-weather-details">
                        <img src={getIconUrl(currentWeatherData.icon)} alt={currentWeatherData.description} className="weather-icon" />
                        <p className="temperature">{currentWeatherData.temperature}°C</p>
                        <p className="description">{currentWeatherData.description}</p>
                    </div>
                    <div className="additional-info">
                        <p>Humidity: {currentWeatherData.humidity}%</p>
                        <p>Wind Speed: {currentWeatherData.windSpeed} m/s</p>
                    </div>
                </div>

                {/* 5-Day Forecast Section */}
                {forecastData && forecastData.length > 0 && (
                    <div className="forecast-section">
                        <h3>5-Day Forecast</h3>
                        <div className="forecast-grid">
                            {forecastData.map((day, index) => (
                                <div key={index} className="forecast-day-card">
                                    <p className="forecast-date">{formatDate(day.date)}</p>
                                    <img src={getIconUrl(day.icon)} alt={day.description} className="forecast-icon" />
                                    <p className="forecast-temp">{Math.round(day.temp_min)}°C / {Math.round(day.temp_max)}°C</p>
                                    <p className="forecast-description">{day.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WeatherDisplay;