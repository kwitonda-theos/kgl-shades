const Review = require('../models/Review');

// ============================================================
// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
// ============================================================
const getReviews = async (req, res) => {
    try {
        // Populate both the product and user references so the frontend
        // can display product names and reviewer info without extra API calls
        const reviews = await Review.find({})
            .populate('product', 'name basePrice')
            .populate('user', 'firstName lastName');

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Get all reviews for a specific product
// @route   GET /api/reviews/product/:productId
// @access  Public
// ============================================================
const getReviewsByProduct = async (req, res) => {
    try {
        // Filter reviews where the 'product' field matches the productId
        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'firstName lastName')
            .sort({ createdAt: -1 });   // newest reviews first

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Get a single review by its MongoDB _id
// @route   GET /api/reviews/:id
// @access  Public
// ============================================================
const getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('product', 'name')
            .populate('user', 'firstName lastName');

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.status(200).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Create a new review
// @route   POST /api/reviews
// @access  Public
// @body    { rating, content, product, user }
// ============================================================
const createReview = async (req, res) => {
    try {
        const { rating, content, product, user } = req.body;

        // Optional: prevent a user from reviewing the same product twice
        const existingReview = await Review.findOne({ product, user });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        // Create the review — Mongoose validates rating is between 1-5 (schema min/max)
        const review = await Review.create({
            rating,
            content,
            product,
            user
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Public (should be limited to the review's author)
// ============================================================
const updateReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.status(200).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Public (should be limited to the review's author or admin)
// ============================================================
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getReviews,
    getReviewsByProduct,
    getReviewById,
    createReview,
    updateReview,
    deleteReview
};
