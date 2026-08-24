const express = require('express');
const router = express.Router();
const { handleClerkWebhook } = require('../controllers/webhookController');

// ── Webhook endpoint for Clerk ─────────────────────────────────
// Note: Svix verifies the cryptographic signature from req.rawBody or req.body
router.post('/clerk', handleClerkWebhook);

module.exports = router;
