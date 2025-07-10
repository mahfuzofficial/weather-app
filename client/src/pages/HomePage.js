// frontend/src/pages/HomePage.js

import React, { useState } from 'react';
import axios from 'axios';
import WeatherDisplay from '../components/WeatherDisplay'; // Our new weather display component
import { useAuth } from '../context/AuthContext'; // To check if user is authenticated
import './HomePage.css'; // Styling for HomePage

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

function HomePage() {
    const { isAuthenticated } = useAuth(); // Get authentication status
    const [city, setCity] = useState('');
    const [weatherData, setWeatherData] = useState(null); // Will hold current weather
    const [forecastData, setForecastData] = useState([]); // Will hold 5-day forecast
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [saveMessage, setSaveMessage] = useState(''); // Message for save operation

    // Handle city search
    const handleSearch = async () => {
        if (!city.trim()) {
            setError('Please enter a city name.');
            setWeatherData(null);
            setForecastData([]);
            setSaveMessage('');
            return;
        }

        setLoading(true);
        setError('');
        setWeatherData(null);
        setForecastData([]);
        setSaveMessage('');

        try {
            const response = await axios.get(`${API_BASE_URL}/weather/${city}`);
            setWeatherData(response.data.currentWeatherData);
            setForecastData(response.data.forecastData);
        } catch (err) {
            console.error('Error fetching weather:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to fetch weather data. Check city name or try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle saving a city
    const handleSaveCity = async () => {
        if (!isAuthenticated) {
            setError('Please log in to save cities.');
            return;
        }
        if (!weatherData || !weatherData.city) {
            setError('No city weather displayed to save.');
            return;
        }

        setSaveMessage(''); // Clear previous save messages

        try {
            // Send POST request with current weather and forecast data
            await axios.post(`${API_BASE_URL}/weather`, {
                name: weatherData.city,
                currentWeatherData: weatherData,
                forecastData: forecastData
            });
            setSaveMessage('City saved successfully!');
            setError(''); // Clear any previous errors
        } catch (err) {
            console.error('Error saving city:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setSaveMessage(`Error: ${err.response.data.message}`);
            } else {
                setSaveMessage('Failed to save city.');
            }
        }
    };

    return (
        <div className="home-page">
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Enter city name"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch();
                        }
                    }}
                />
                <button onClick={handleSearch} className="search-button">Search</button>
            </div>

            {loading && <p className="message loading">Loading weather data...</p>}
            {error && <p className="message error">{error}</p>}
            {saveMessage && <p className="message success">{saveMessage}</p>} {/* Display save message */}

            {weatherData && (
                <div className="weather-results-container">
                    <WeatherDisplay currentWeatherData={weatherData} forecastData={forecastData} />
                    {isAuthenticated && (
                        <button onClick={handleSaveCity} className="save-city-button">Save City</button>
                    )}
                </div>
            )}
        </div>
    );
}

export default HomePage;