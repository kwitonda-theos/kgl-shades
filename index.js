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

const app = express();
const PORT = process.env.PORT || 5000; // Fixed: was Process.env (capital P caused a crash)

// Connect to MongoDB Atlas before the server starts taking requests
connectDB();

// ── Global Middleware ──────────────────────────────────────────
// Allow requests from the React frontend running on port 3000
app.use(cors({ origin: 'http://localhost:3000' }));
// Parse incoming JSON request bodies (req.body)
app.use(express.json());

// ── API Routes ─────────────────────────────────────────────────
// All routes are prefixed with /api to clearly separate the API from
// any static files or other middleware you might add later
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/admin', adminRoutes);

// ── Health Check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'success', message: 'KGL Shades API is running smoothly!' });
});

// ── Start Server ───────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Server is buzzing on http://localhost:${PORT}`);
});