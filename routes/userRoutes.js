const express = require('express');
const router = express.Router();

// Import all user controller functions
const {
    getUsers,
    getUserById,
    createUser,
    loginUser,
    updateUser,
    deleteUser
} = require('../controllers/userController');

// ── POST /api/users/login → authenticate a user
router.post('/login', loginUser);

// ── GET /api/users       → fetch all users
// ── POST /api/users      → create (register) a new user
router.route('/').get(getUsers).post(createUser);

// ── GET /api/users/:id   → fetch one user by ID
// ── PUT /api/users/:id   → update a user by ID
// ── DELETE /api/users/:id → delete a user by ID
router.route('/:id').get(getUserById).put(updateUser).delete(deleteUser);

module.exports = router;
