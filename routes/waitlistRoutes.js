const express = require('express');
const router = express.Router();

// Import all waitlist controller functions
const {
    getWaitlistEntries,
    getWaitlistByProduct,
    getWaitlistByUser,
    addToWaitlist,
    removeFromWaitlist
} = require('../controllers/waitlistController');

// ── GET /api/waitlist    → fetch all waitlist entries (admin view)
// ── POST /api/waitlist   → add a user to a product's waitlist
router.route('/').get(getWaitlistEntries).post(addToWaitlist);

// ── GET /api/waitlist/product/:productId → all users waiting for a given product
// NOTE: These named-segment routes must come before '/:id'
router.route('/product/:productId').get(getWaitlistByProduct);

// ── GET /api/waitlist/user/:userId → all products a user is waiting for
router.route('/user/:userId').get(getWaitlistByUser);

// ── DELETE /api/waitlist/:id → remove a specific waitlist entry
// (No PUT — waitlist entries are either added or removed, never edited)
router.route('/:id').delete(removeFromWaitlist);

module.exports = router;
