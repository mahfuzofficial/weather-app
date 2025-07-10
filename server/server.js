// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // Import cors

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for all routes
// This allows our frontend (running on a different port) to make requests to our backend
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

// Basic route to check if server is running
app.get('/', (req, res) => {
    res.send('Weather App Backend is running!');
});

// Import weather routes (we'll create this file next)
const weatherRoutes = require('./routes/weatherRoutes');
app.use('/api', weatherRoutes); // All weather-related routes will start with /api

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});