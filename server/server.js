// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for all routes
// In a real application, you might want to restrict this to specific origins
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

// Basic route to check if server is running
app.get('/', (req, res) => {
    res.send('Weather App Backend is running!');
});

// Import and use authentication routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes); // All auth-related routes will start with /api/auth

// Import and use weather routes
const weatherRoutes = require('./routes/weatherRoutes');
app.use('/api', weatherRoutes); // All weather-related routes will start with /api

// Error handling middleware (optional, but good practice)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});