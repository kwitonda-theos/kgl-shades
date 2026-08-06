const Product = require('../models/Products');
const { getOrSet, invalidatePrefix } = require('../middleware/cache');

// Cache TTL for products (5 minutes)
const PRODUCT_TTL = 300;

// ============================================================
// @desc    Get all products
// @route   GET /api/products
// @access  Public
// ============================================================
const getProducts = async (req, res) => {
    try {
        const { data, fromCache } = await getOrSet(
            'products:all',
            () => Product.find({}),
            PRODUCT_TTL
        );

        res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
        res.set('X-Cache', fromCache ? 'HIT' : 'MISS');
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Get a single product by its MongoDB _id
// @route   GET /api/products/:id
// @access  Public
// ============================================================
const getProductById = async (req, res) => {
    try {
        const { data, fromCache } = await getOrSet(
            `products:${req.params.id}`,
            () => Product.findById(req.params.id),
            PRODUCT_TTL
        );

        if (!data) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
        res.set('X-Cache', fromCache ? 'HIT' : 'MISS');
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Create a new product
// @route   POST /api/products
// @access  Public (would normally be admin-only)
// ============================================================
const createProduct = async (req, res) => {
    try {
        const { name, description, basePrice, mainImage, lifestyleImage, lensOption } = req.body;

        // Create the product — lensOption is an array of embedded sub-documents
        // Each lens option has: name, description, priceUpcharge
        const product = await Product.create({
            name,
            description,
            basePrice,
            mainImage,
            lifestyleImage,
            lensOption   // Mongoose will validate each sub-doc against lensOptions schema
        });

        // Invalidate product cache + collections (since collections populate products)
        invalidatePrefix('products:');
        invalidatePrefix('collections:');

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Public (would normally be admin-only)
// ============================================================
const updateProduct = async (req, res) => {
    try {
        // { new: true } returns the modified document rather than the original
        // { runValidators: true } ensures the update respects schema rules
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Invalidate product cache + collections (since collections populate products)
        invalidatePrefix('products:');
        invalidatePrefix('collections:');

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Public (would normally be admin-only)
// ============================================================
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Invalidate product cache + collections (since collections populate products)
        invalidatePrefix('products:');
        invalidatePrefix('collections:');

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
