const Collection = require('../models/Collection');
const { getOrSet, invalidatePrefix } = require('../middleware/cache');

// Cache TTL for collections (5 minutes)
const COLLECTION_TTL = 300;

// Helper to generate a slug from a name
const toSlug = (name) =>
    name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

// ============================================================
// @desc    Get all collections (with products populated)
// @route   GET /api/collections
// @access  Public
// ============================================================
const getCollections = async (req, res) => {
    try {
        const { data, fromCache } = await getOrSet(
            'collections:all',
            () => Collection.find({}).populate('products'),
            COLLECTION_TTL
        );

        res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
        res.set('X-Cache', fromCache ? 'HIT' : 'MISS');
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Get a single collection by id (with products populated)
// @route   GET /api/collections/:id
// @access  Public
// ============================================================
const getCollectionById = async (req, res) => {
    try {
        const { data, fromCache } = await getOrSet(
            `collections:${req.params.id}`,
            () => Collection.findById(req.params.id).populate('products'),
            COLLECTION_TTL
        );

        if (!data) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
        res.set('X-Cache', fromCache ? 'HIT' : 'MISS');
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Create a new collection
// @route   POST /api/collections
// @access  Admin
// ============================================================
const createCollection = async (req, res) => {
    try {
        const { name, description, coverImage, products } = req.body;

        // Auto-generate slug; make unique if needed
        let slug = toSlug(name);
        const existing = await Collection.findOne({ slug });
        if (existing) {
            slug = `${slug}-${Date.now()}`;
        }

        const collection = await Collection.create({
            name,
            slug,
            description,
            coverImage: coverImage || '',
            products: products || []
        });

        // Populate products before returning
        await collection.populate('products');

        // Invalidate collection and product caches
        invalidatePrefix('collections:');
        invalidatePrefix('products:');

        res.status(201).json(collection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Update a collection
// @route   PUT /api/collections/:id
// @access  Admin
// ============================================================
const updateCollection = async (req, res) => {
    try {
        const { name, description, coverImage, products } = req.body;
        const update = { description, coverImage, products };

        // Regenerate slug only if name changed
        if (name) {
            update.name = name;
            update.slug = toSlug(name);
        }

        const collection = await Collection.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true, runValidators: true }
        ).populate('products');

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        // Invalidate collection and product caches
        invalidatePrefix('collections:');
        invalidatePrefix('products:');

        res.status(200).json(collection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Delete a collection
// @route   DELETE /api/collections/:id
// @access  Admin
// ============================================================
const deleteCollection = async (req, res) => {
    try {
        const collection = await Collection.findByIdAndDelete(req.params.id);
        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        // Invalidate collection and product caches
        invalidatePrefix('collections:');
        invalidatePrefix('products:');

        res.status(200).json({ message: 'Collection deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCollections,
    getCollectionById,
    createCollection,
    updateCollection,
    deleteCollection
};
