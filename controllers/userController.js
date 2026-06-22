const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// JWT secret — in production, store this in your .env file
const JWT_SECRET = process.env.JWT_SECRET || 'kgl-shades-secret-key-change-me';

// Helper: generate a JWT token for a user
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' } // token lasts 7 days
    );
};

// ============================================================
// @desc    Get all users
// @route   GET /api/users
// @access  Public (you'd normally protect this with admin auth)
// ============================================================
const getUsers = async (req, res) => {
    try {
        // .find({}) returns every document in the 'users' collection
        // Exclude passwordHash from the response for security
        const users = await User.find({}).select('-passwordHash');
        res.status(200).json(users);
    } catch (error) {
        // 500 = Internal Server Error — something broke on our end
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Get a single user by their MongoDB _id
// @route   GET /api/users/:id
// @access  Public
// ============================================================
const getUserById = async (req, res) => {
    try {
        // req.params.id pulls the :id from the URL (e.g. /api/users/abc123)
        const user = await User.findById(req.params.id).select('-passwordHash');

        // If no document matched the given ID, return a 404
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Register a new user (signup)
// @route   POST /api/users
// @access  Public
// ============================================================
const createUser = async (req, res) => {
    try {
        // Destructure the fields we expect from the request body
        const { email, passwordHash: plainPassword, firstName, lastName, phone } = req.body;

        // Validate required fields
        if (!email || !plainPassword || !phone) {
            return res.status(400).json({ message: 'Email, password, and phone are required' });
        }

        // Check if a user with this email already exists (email is unique)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists' });
        }

        // Hash the password with bcrypt (10 salt rounds)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        // .create() is shorthand for new User({...}).save()
        const user = await User.create({
            email,
            passwordHash: hashedPassword,
            firstName,
            lastName,
            phone
        });

        // Generate a JWT token so the user is logged in immediately after signup
        const token = generateToken(user);

        // 201 = Created — the resource was successfully created
        // Return user data (without the hashed password) + token
        res.status(201).json({
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Login a user
// @route   POST /api/users/login
// @access  Public
// ============================================================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate a JWT token
        const token = generateToken(user);

        // Return user data (without the hashed password) + token
        res.status(200).json({
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Update an existing user
// @route   PUT /api/users/:id
// @access  Public
// ============================================================
const updateUser = async (req, res) => {
    try {
        // findByIdAndUpdate takes the ID, the new data, and options:
        //   - { new: true }       → return the UPDATED document (not the old one)
        //   - { runValidators: true } → re-run schema validations on the new data
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-passwordHash');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Public
// ============================================================
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return confirmation so the frontend knows it worked
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export all controller functions so they can be used in the routes file
module.exports = {
    getUsers,
    getUserById,
    createUser,
    loginUser,
    updateUser,
    deleteUser
};
