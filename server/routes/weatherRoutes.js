// backend/routes/weatherRoutes.js

const express = require('express');
const axios = require('axios'); // For making HTTP requests to OpenWeatherMap
const City = require('../models/City'); // Our City Mongoose model

const router = express.Router();

// --- API Endpoint 1: Fetch current weather data from OpenWeatherMap ---
// GET /api/weather/:city
router.get('/weather/:city', async (req, res) => {
    const cityName = req.params.city;
    const apiKey = process.env.OPENWEATHER_API_KEY; // Get API key from environment variables

    // Basic validation for city name
    if (!cityName) {
        return res.status(400).json({ message: 'City name is required' });
    }

    try {
        // Construct the OpenWeatherMap API URL
        const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`; // units=metric for Celsius

        // Make the request to OpenWeatherMap
        const response = await axios.get(weatherApiUrl);

        // Extract relevant weather data
        const weatherData = {
            city: response.data.name,
            temperature: response.data.main.temp,
            description: response.data.weather[0].description,
            humidity: response.data.main.humidity,
            windSpeed: response.data.wind.speed
        };

        res.status(200).json(weatherData); // Send back the extracted data
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: 'City not found. Please check the spelling.' });
        }
        console.error('Error fetching weather data:', error.message);
        res.status(500).json({ message: 'Error fetching weather data. Please try again later.' });
    }
});

// --- API Endpoint 2: Save a searched city to MongoDB ---
// POST /api/weather
router.post('/weather', async (req, res) => {
    const { name } = req.body; // Expecting { name: "CityName" } in the request body

    if (!name) {
        return res.status(400).json({ message: 'City name is required to save.' });
    }

    try {
        // Check if the city already exists in the database to prevent duplicates
        let city = await City.findOne({ name: name });

        if (city) {
            return res.status(409).json({ message: 'City already saved.' }); // 409 Conflict
        }

        // Create a new City document
        city = new City({ name });

        // Save the city to the database
        await city.save();
        res.status(201).json(city); // 201 Created, send back the saved city document
    } catch (error) {
        console.error('Error saving city:', error.message);
        res.status(500).json({ message: 'Error saving city to database.' });
    }
});

// --- API Endpoint 3: Retrieve the list of saved cities from the database ---
// GET /api/weather
router.get('/weather', async (req, res) => {
    try {
        // Find all cities, sorted by creation date (newest first)
        const cities = await City.find().sort({ createdAt: -1 });
        res.status(200).json(cities); // Send back the list of saved cities
    } catch (error) {
        console.error('Error fetching saved cities:', error.message);
        res.status(500).json({ message: 'Error fetching saved cities from database.' });
    }
});

// --- API Endpoint 4: Remove a city from the saved list in the database ---
// DELETE /api/weather/:id
router.delete('/weather/:id', async (req, res) => {
    const cityId = req.params.id; // Get the ID from the URL parameters

    try {
        // Find and delete the city by its ID
        const deletedCity = await City.findByIdAndDelete(cityId);

        if (!deletedCity) {
            return res.status(404).json({ message: 'City not found in saved list.' });
        }

        res.status(200).json({ message: 'City deleted successfully.' });
    } catch (error) {
        console.error('Error deleting city:', error.message);
        res.status(500).json({ message: 'Error deleting city from database.' });
    }
});

module.exports = router;