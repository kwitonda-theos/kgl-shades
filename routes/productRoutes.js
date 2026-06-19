const express = require('express');
const router = express.Router();

// Import all product controller functions
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

// ── GET /api/products    → fetch all products
// ── POST /api/products   → create a new product
router.route('/').get(getProducts).post(createProduct);

// ── GET /api/products/:id    → fetch one product by ID
// ── PUT /api/products/:id    → update a product by ID
// ── DELETE /api/products/:id → delete a product by ID
router.route('/:id').get(getProductById).put(updateProduct).delete(deleteProduct);

module.exports = router;
