const express = require('express');
const router = express.Router();

// Import all review controller functions
const {
    getReviews,
    getReviewsByProduct,
    getReviewById,
    createReview,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');

// ── GET /api/reviews     → fetch all reviews
// ── POST /api/reviews    → create a new review
router.route('/').get(getReviews).post(createReview);

// ── GET /api/reviews/product/:productId → fetch all reviews for a specific product
// NOTE: Defined before '/:id' so "product" isn't parsed as a MongoDB ObjectId
router.route('/product/:productId').get(getReviewsByProduct);

// ── GET /api/reviews/:id    → fetch one review by ID
// ── PUT /api/reviews/:id    → update a review (e.g. edit rating/content)
// ── DELETE /api/reviews/:id → delete a review
router.route('/:id').get(getReviewById).put(updateReview).delete(deleteReview);

module.exports = router;
