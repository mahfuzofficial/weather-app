// backend/models/City.js

const mongoose = require('mongoose');

// Define the schema for a saved city
const citySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true // Ensure city names are unique
    },
    // Optional: You can save more weather data here if you want to display it directly from DB
    // For now, we'll just save the name and fetch fresh data when needed.
    createdAt: {
        type: Date,
        default: Date.now // Automatically set the creation timestamp
    }
});

// Create the Mongoose model from the schema
const City = mongoose.model('City', citySchema);

module.exports = City;