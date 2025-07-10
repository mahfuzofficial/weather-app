// backend/routes/authRoutes.js

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Our User model

const router = express.Router();

// Helper function to generate a JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expires in 1 hour
    });
};

// --- Route 1: Register a new user ---
// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        user = new User({ email, password });
        await user.save(); // Password hashing happens automatically via pre-save hook

        // Respond with user details and a token
        res.status(201).json({
            _id: user._id,
            email: user.email,
            token: generateToken(user._id), // Generate and send JWT
        });
    } catch (error) {
        console.error('Error registering user:', error.message);
        // Handle Mongoose validation errors or other server errors
        if (error.code === 11000) { // Duplicate key error (e.g., email already exists)
            return res.status(400).json({ message: 'Email already registered.' });
        }
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// --- Route 2: Authenticate user and get token ---
// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare entered password with hashed password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Respond with user details and a token
        res.status(200).json({
            _id: user._id,
            email: user.email,
            token: generateToken(user._id), // Generate and send JWT
        });
    } catch (error) {
        console.error('Error logging in user:', error.message);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// --- Route 3: Get user profile (protected route example) ---
// GET /api/auth/profile
// This route uses the 'protect' middleware to ensure only authenticated users can access it
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware
router.get('/profile', protect, (req, res) => {
    // req.user is set by the protect middleware
    res.status(200).json({
        _id: req.user._id,
        email: req.user.email,
    });
});


module.exports = router;