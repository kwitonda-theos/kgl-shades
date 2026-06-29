const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const {
    getCollections,
    getCollectionById,
    createCollection,
    updateCollection,
    deleteCollection
} = require('../controllers/collectionController');

// Public routes
router.get('/', getCollections);
router.get('/:id', getCollectionById);

// Admin-only routes
router.post('/', adminAuth, createCollection);
router.put('/:id', adminAuth, updateCollection);
router.delete('/:id', adminAuth, deleteCollection);

module.exports = router;
