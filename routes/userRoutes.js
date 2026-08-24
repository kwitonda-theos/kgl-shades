const express = require('express');
const router = express.Router();

// Import all user controller functions
const {
    getUsers,
    getUserById,
    getUserByClerkId,
    syncClerkUser,
    createUser,
    loginUser,
    updateUser,
    deleteUser,
    updateUserPreferences
} = require('../controllers/userController');

// ── POST /api/users/sync  → instant sync/upsert Clerk user in MongoDB
router.post('/sync', syncClerkUser);

// ── GET /api/users/by-clerk/:clerkId → fetch user by Clerk ID
router.get('/by-clerk/:clerkId', getUserByClerkId);

// ── POST /api/users/login → authenticate a user (legacy fallback)
router.post('/login', loginUser);

// ── GET /api/users       → fetch all users
// ── POST /api/users      → create (register) a new user (legacy fallback)
router.route('/').get(getUsers).post(createUser);

// ── GET /api/users/:id   → fetch one user by ID
// ── PUT /api/users/:id   → update a user by ID
// ── DELETE /api/users/:id → delete a user by ID
router.route('/:id').get(getUserById).put(updateUser).delete(deleteUser);

// ── PUT /api/users/:id/preferences → update user cart and theme
router.put('/:id/preferences', updateUserPreferences);

module.exports = router;
