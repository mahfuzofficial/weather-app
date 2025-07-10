// backend/routes/weatherRoutes.js

const express = require('express');
const axios = require('axios');
const City = require('../models/City');
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

const router = express.Router();

// Helper function to fetch current weather and 5-day forecast
const fetchWeatherAndForecast = async (cityName, apiKey) => {
    // API for current weather
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;
    // API for 5-day / 3-hour forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`;

    try {
        const [currentResponse, forecastResponse] = await Promise.all([
            axios.get(currentWeatherUrl),
            axios.get(forecastUrl)
        ]);

        // Process current weather data
        const currentWeatherData = {
            city: currentResponse.data.name,
            temperature: currentResponse.data.main.temp,
            description: currentResponse.data.weather[0].description,
            humidity: currentResponse.data.main.humidity,
            windSpeed: currentResponse.data.wind.speed,
            icon: currentResponse.data.weather[0].icon // Get weather icon code
        };

        // Process 5-day forecast data
        const dailyForecasts = {};
        forecastResponse.data.list.forEach(item => {
            const date = new Date(item.dt * 1000); // Convert timestamp to Date object
            const dateString = date.toISOString().split('T')[0]; // Get YYYY-MM-DD

            if (!dailyForecasts[dateString]) {
                dailyForecasts[dateString] = {
                    temp_min: item.main.temp,
                    temp_max: item.main.temp,
                    description: item.weather[0].description,
                    icon: item.weather[0].icon,
                    count: 1 // To average description or pick most common
                };
            } else {
                dailyForecasts[dateString].temp_min = Math.min(dailyForecasts[dateString].temp_min, item.main.temp);
                dailyForecasts[dateString].temp_max = Math.max(dailyForecasts[dateString].temp_max, item.main.temp);
                // For simplicity, we'll just take the description from the first entry of the day
                // or you could implement logic to find the most frequent description/icon
            }
        });

        // Convert dailyForecasts object to an array
        const forecastData = Object.keys(dailyForecasts).map(date => ({
            date: date,
            temp_min: dailyForecasts[date].temp_min,
            temp_max: dailyForecasts[date].temp_max,
            description: dailyForecasts[date].description,
            icon: dailyForecasts[date].icon
        }));

        // OpenWeatherMap 5-day forecast includes current day. We want 5 *future* days.
        // Slice to get the next 5 days, excluding the current day's first entry.
        // The forecast API returns data in 3-hour steps. We need to aggregate it per day.
        // Let's refine this to get distinct days.
        const aggregatedForecast = [];
        const today = new Date().toISOString().split('T')[0];
        const uniqueDates = new Set();

        for (const item of forecastResponse.data.list) {
            const date = new Date(item.dt * 1000);
            const dateString = date.toISOString().split('T')[0];

            if (dateString === today) {
                continue; // Skip today's forecast entries from the 5-day forecast
            }

            if (!uniqueDates.has(dateString)) {
                uniqueDates.add(dateString);
                aggregatedForecast.push({
                    date: dateString,
                    temp_min: item.main.temp_min,
                    temp_max: item.main.temp_max,
                    description: item.weather[0].description,
                    icon: item.weather[0].icon,
                    // We'll update min/max later by iterating through all entries for that day
                });
            } else {
                // Update min/max for existing date
                const existingDay = aggregatedForecast.find(d => d.date === dateString);
                if (existingDay) {
                    existingDay.temp_min = Math.min(existingDay.temp_min, item.main.temp_min);
                    existingDay.temp_max = Math.max(existingDay.temp_max, item.main.temp_max);
                }
            }
        }
        // Take up to the next 5 days
        const finalForecastData = aggregatedForecast.slice(0, 5);


        return { currentWeatherData, forecastData: finalForecastData };

    } catch (error) {
        // Re-throw the error to be caught by the calling function
        throw error;
    }
};


// --- API Endpoint 1: Fetch current weather data and 5-day forecast from OpenWeatherMap ---
// GET /api/weather/:city
router.get('/weather/:city', async (req, res) => {
    const cityName = req.params.city;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!cityName) {
        return res.status(400).json({ message: 'City name is required' });
    }

    try {
        const { currentWeatherData, forecastData } = await fetchWeatherAndForecast(cityName, apiKey);
        res.status(200).json({ currentWeatherData, forecastData });
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: 'City not found. Please check the spelling.' });
        }
        console.error('Error fetching weather data:', error.message);
        res.status(500).json({ message: 'Error fetching weather data. Please try again later.' });
    }
});

// --- API Endpoint 2: Save a searched city to MongoDB (Protected) ---
// POST /api/weather
router.post('/weather', protect, async (req, res) => {
    // req.user is available due to 'protect' middleware
    const userId = req.user._id;
    const { name, currentWeatherData, forecastData } = req.body; // Expecting full weather data

    if (!name || !currentWeatherData || !forecastData) {
        return res.status(400).json({ message: 'City name and weather data are required to save.' });
    }

    try {
        // Check if the user has already saved this city
        let city = await City.findOne({ userId, name: name });

        if (city) {
            return res.status(409).json({ message: 'City already saved for this user.' });
        }

        // Create a new City document linked to the user
        city = new City({
            userId,
            name,
            currentWeatherData,
            forecastData
        });

        await city.save();
        res.status(201).json(city);
    } catch (error) {
        console.error('Error saving city:', error.message);
        if (error.code === 11000) { // Duplicate key error from compound index
            return res.status(400).json({ message: 'You have already saved this city.' });
        }
        res.status(500).json({ message: 'Error saving city to database.' });
    }
});

// --- API Endpoint 3: Retrieve the list of saved cities from the database (Protected) ---
// GET /api/weather
router.get('/weather', protect, async (req, res) => {
    // req.user is available due to 'protect' middleware
    const userId = req.user._id;

    try {
        // Find all cities saved by the current user, sorted by creation date
        const cities = await City.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(cities);
    } catch (error) {
        console.error('Error fetching saved cities:', error.message);
        res.status(500).json({ message: 'Error fetching saved cities from database.' });
    }
});

// --- API Endpoint 4: Remove a city from the saved list in the database (Protected) ---
// DELETE /api/weather/:id
router.delete('/weather/:id', protect, async (req, res) => {
    // req.user is available due to 'protect' middleware
    const userId = req.user._id;
    const cityId = req.params.id;

    try {
        // Find and delete the city by its ID, ensuring it belongs to the current user
        const deletedCity = await City.findOneAndDelete({ _id: cityId, userId: userId });

        if (!deletedCity) {
            // If not found, it's either wrong ID or doesn't belong to the user
            return res.status(404).json({ message: 'City not found or you do not have permission to delete it.' });
        }

        res.status(200).json({ message: 'City deleted successfully.' });
    } catch (error) {
        console.error('Error deleting city:', error.message);
        res.status(500).json({ message: 'Error deleting city from database.' });
    }
});

module.exports = router;