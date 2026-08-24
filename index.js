require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import route files — each file groups all endpoints for that resource
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const waitlistRoutes = require('./routes/waitlistRoutes');
const adminRoutes = require('./routes/adminRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas before the server starts taking requests
connectDB();

// ── Global Middleware ─────────────────────────────────────────
app.use(cors()); // Allow all origins for dev

// Parse incoming JSON request bodies (req.body) and preserve raw buffer for webhook signature verification
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

// ── API Routes ─────────────────────────────────────────────────
// All routes are prefixed with /api to clearly separate the API
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/webhooks', webhookRoutes);

// ── Health Check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'success', message: 'KGL Shades API is running smoothly!' });
});

// ── Cache Stats (for debugging / monitoring) ──────────────────
const { getStats } = require('./middleware/cache');
app.get('/api/cache-stats', (req, res) => {
    res.json({ status: 'success', cache: getStats() });
});

// ── Start Server ───────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Server is buzzing on http://localhost:${PORT}`);
});