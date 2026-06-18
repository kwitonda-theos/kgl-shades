const User = require('../models/user');

// ============================================================
// @desc    Get all users
// @route   GET /api/users
// @access  Public (you'd normally protect this with admin auth)
// ============================================================
const getUsers = async (req, res) => {
    try {
        // .find({}) returns every document in the 'users' collection
        const users = await User.find({});
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
        const user = await User.findById(req.params.id);

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
// @desc    Create a new user
// @route   POST /api/users
// @access  Public
// ============================================================
const createUser = async (req, res) => {
    try {
        // Destructure the fields we expect from the request body
        const { email, passwordHash, firstName, lastName, phone } = req.body;

        // Check if a user with this email already exists (email is unique)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists' });
        }

        // .create() is shorthand for new User({...}).save()
        const user = await User.create({
            email,
            passwordHash,
            firstName,
            lastName,
            phone
        });

        // 201 = Created — the resource was successfully created
        res.status(201).json(user);
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
        );

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
    updateUser,
    deleteUser
};
