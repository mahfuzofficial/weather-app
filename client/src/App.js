// frontend/src/App.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Our component-specific styles

const API_BASE_URL = 'http://localhost:5000/api'; // Our backend API base URL

function App() {
  const [city, setCity] = useState(''); // State for the city input field
  const [weatherData, setWeatherData] = useState(null); // State for current weather data
  const [savedCities, setSavedCities] = useState([]); // State for list of saved cities
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(''); // State for error messages

  // --- Fetch saved cities when the component loads ---
  useEffect(() => {
    fetchSavedCities();
  }, []); // Empty dependency array means this runs once on component mount

  // Function to fetch saved cities from our backend
  const fetchSavedCities = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/weather`);
      setSavedCities(response.data);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching saved cities:', err);
      setError('Could not load saved cities.');
    }
  };

  // --- Handle city search ---
  const handleSearch = async () => {
    if (!city.trim()) { // Check if city input is empty
      setError('Please enter a city name.');
      return;
    }

    setLoading(true); // Show loading indicator
    setError(''); // Clear previous errors
    setWeatherData(null); // Clear previous weather data

    try {
      const response = await axios.get(`${API_BASE_URL}/weather/${city}`);
      setWeatherData(response.data); // Set the fetched weather data
    } catch (err) {
      console.error('Error fetching weather:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message); // Display error message from backend
      } else {
        setError('Failed to fetch weather data. Check city name or try again later.');
      }
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  // --- Handle saving a city ---
  const handleSaveCity = async () => {
    if (!weatherData || !weatherData.city) {
      setError('No city weather displayed to save.');
      return;
    }

    try {
      // Send a POST request to save the current displayed city
      await axios.post(`${API_BASE_URL}/weather`, { name: weatherData.city });
      fetchSavedCities(); // Refresh the list of saved cities
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error saving city:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message); // Display error message from backend
      } else {
        setError('Failed to save city.');
      }
    }
  };

  // --- Handle deleting a city ---
  const handleDeleteCity = async (id) => {
    try {
      // Send a DELETE request to remove the city by its ID
      await axios.delete(`${API_BASE_URL}/weather/${id}`);
      fetchSavedCities(); // Refresh the list of saved cities
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error deleting city:', err);
      setError('Failed to delete city.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>MERN Weather App</h1>
      </header>

      <main className="App-main">
        <section className="search-section">
          <h2>Search Weather</h2>
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Enter city name"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={(e) => { // Allow pressing Enter to search
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <button onClick={handleSearch}>Search</button>
          </div>
          {loading && <p className="loading-message">Loading weather data...</p>}
          {error && <p className="error-message">{error}</p>}

          {weatherData && (
            <div className="weather-display">
              <h3>{weatherData.city}</h3>
              <p>Temperature: {weatherData.temperature}°C</p>
              <p>Description: {weatherData.description}</p>
              <p>Humidity: {weatherData.humidity}%</p>
              <p>Wind Speed: {weatherData.windSpeed} m/s</p>
              <button onClick={handleSaveCity} className="save-button">Save City</button>
            </div>
          )}
        </section>

        <section className="saved-cities-section">
          <h2>Saved Cities</h2>
          {savedCities.length === 0 ? (
            <p>No cities saved yet.</p>
          ) : (
            <ul className="saved-cities-list">
              {savedCities.map((savedCity) => (
                <li key={savedCity._id} className="saved-city-item">
                  <span>{savedCity.name}</span>
                  <button onClick={() => handleDeleteCity(savedCity._id)} className="delete-button">
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;