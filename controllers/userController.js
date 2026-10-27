const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
        const users = await User.find({}).select('-passwordHash');
        res.status(200).json(users);
    } catch (error) {
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
        const user = await User.findById(req.params.id)
            .populate('cart.product')
            .select('-passwordHash');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// ============================================================
// @desc    Register a new user (signup - legacy/fallback)
// @route   POST /api/users
// @access  Public
// ============================================================
const createUser = async (req, res) => {
    try {
        const { email, passwordHash: plainPassword, firstName, lastName, phone } = req.body;

        if (!email || !plainPassword) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        const user = await User.create({
            email: email.toLowerCase().trim(),
            passwordHash: hashedPassword,
            firstName,
            lastName,
            phone: phone ? String(phone) : ''
        });

        const token = generateToken(user);

        res.status(201).json({
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            imageUrl: user.imageUrl,
            role: user.role,
            theme: user.theme,
            cart: user.cart,
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Login a user (legacy/fallback)
// @route   POST /api/users/login
// @access  Public
// ============================================================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() }).populate('cart.product');
        if (!user || !user.passwordHash) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user);

        res.status(200).json({
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            imageUrl: user.imageUrl,
            role: user.role,
            theme: user.theme,
            cart: user.cart,
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
// @desc    Update user preferences (cart & theme)
// @route   PUT /api/users/:id/preferences
// @access  Public
// ============================================================
const updateUserPreferences = async (req, res) => {
    try {
        const { theme, cart } = req.body;
        
        const updateData = {};
        if (theme !== undefined) updateData.theme = theme;
        if (cart !== undefined) updateData.cart = cart;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('cart.product').select('-passwordHash');

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

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    loginUser,
    updateUser,
    deleteUser,
    updateUserPreferences
};
