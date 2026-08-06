const Waitlist = require('../models/Waitlist');
const { getOrSet, invalidatePrefix } = require('../middleware/cache');

// Cache TTL for waitlist (2 minutes)
const WAITLIST_TTL = 120;

// ============================================================
// @desc    Get all waitlist entries
// @route   GET /api/waitlist
// @access  Public (would normally be admin-only)
// ============================================================
const getWaitlistEntries = async (req, res) => {
    try {
        // Populate both references so we can see which user is waiting for which product
        const { data, fromCache } = await getOrSet(
            'waitlist:all',
            () => Waitlist.find({})
                .populate('product', 'name basePrice mainImage')
                .populate('user', 'firstName lastName email'),
            WAITLIST_TTL
        );

        res.set('Cache-Control', 'private, no-cache');
        res.set('X-Cache', fromCache ? 'HIT' : 'MISS');
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Get all waitlist entries for a specific product
// @route   GET /api/waitlist/product/:productId
// @access  Public
// ============================================================
const getWaitlistByProduct = async (req, res) => {
    try {
        const { data, fromCache } = await getOrSet(
            `waitlist:product:${req.params.productId}`,
            () => Waitlist.find({ product: req.params.productId })
                .populate('user', 'firstName lastName email'),
            WAITLIST_TTL
        );

        res.set('Cache-Control', 'private, no-cache');
        res.set('X-Cache', fromCache ? 'HIT' : 'MISS');
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Get all waitlist entries for a specific user
// @route   GET /api/waitlist/user/:userId
// @access  Public
// ============================================================
const getWaitlistByUser = async (req, res) => {
    try {
        const { data, fromCache } = await getOrSet(
            `waitlist:user:${req.params.userId}`,
            () => Waitlist.find({ user: req.params.userId })
                .populate('product', 'name basePrice mainImage'),
            WAITLIST_TTL
        );

        res.set('Cache-Control', 'private, no-cache');
        res.set('X-Cache', fromCache ? 'HIT' : 'MISS');
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Add a user to a product's waitlist
// @route   POST /api/waitlist
// @access  Public
// @body    { product, user }
// ============================================================
const addToWaitlist = async (req, res) => {
    try {
        const { product, user } = req.body;

        // Prevent duplicate entries — a user shouldn't join the same waitlist twice
        const existingEntry = await Waitlist.findOne({ product, user });
        if (existingEntry) {
            return res.status(400).json({ message: 'User is already on the waitlist for this product' });
        }

        const entry = await Waitlist.create({ product, user });

        // Invalidate all waitlist caches
        invalidatePrefix('waitlist:');

        res.status(201).json(entry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Remove a user from a product's waitlist
// @route   DELETE /api/waitlist/:id
// @access  Public
// ============================================================
const removeFromWaitlist = async (req, res) => {
    try {
        const entry = await Waitlist.findByIdAndDelete(req.params.id);

        if (!entry) {
            return res.status(404).json({ message: 'Waitlist entry not found' });
        }

        // Invalidate all waitlist caches
        invalidatePrefix('waitlist:');

        res.status(200).json({ message: 'Removed from waitlist successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getWaitlistEntries,
    getWaitlistByProduct,
    getWaitlistByUser,
    addToWaitlist,
    removeFromWaitlist
};
