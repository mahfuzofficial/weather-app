// backend/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For hashing passwords

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // Ensure email is unique for each user
        lowercase: true, // Store emails in lowercase
        trim: true, // Remove whitespace
        match: [/.+@.+\..+/, 'Please enter a valid email address'] // Basic email format validation
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'Password must be at least 6 characters long']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook to hash the password before saving a new user
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    try {
        // Generate a salt (random string) to add to the password before hashing
        const salt = await bcrypt.genSalt(10);
        // Hash the password with the generated salt
        this.password = await bcrypt.hash(this.password, salt);
        next(); // Proceed to save the user
    } catch (error) {
        next(error); // Pass any error to the next middleware
    }
});

// Method to compare entered password with the hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
    // Use bcrypt to compare the plain text password with the hashed password
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;