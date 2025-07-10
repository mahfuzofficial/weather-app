// backend/models/City.js

const mongoose = require('mongoose');

// Define the schema for a saved city
const citySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Link to the User model
        ref: 'User', // Reference the 'User' model
        required: true
    },
    name: {
        type: String,
        required: true,
        // We will handle uniqueness per user in the route logic
    },
    currentWeatherData: { // Store current weather details
        temperature: Number,
        description: String,
        humidity: Number,
        windSpeed: Number,
        icon: String // OpenWeatherMap icon code
    },
    forecastData: [{ // Array to store 5-day forecast data
        date: String, // e.g., 'YYYY-MM-DD'
        temp_min: Number,
        temp_max: Number,
        description: String,
        icon: String
    }],
    createdAt: {
        type: Date,
        default: Date.now // Automatically set the creation timestamp
    }
});

// Add a compound unique index to ensure a user can only save a city once
citySchema.index({ userId: 1, name: 1 }, { unique: true });

// Create the Mongoose model from the schema
const City = mongoose.model('City', citySchema);

module.exports = City;