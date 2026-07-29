const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const adminAuth = require('../middleware/adminAuth');
const { getAnalytics } = require('../controllers/adminController');

// ── Cloudinary configuration ──────────────────────────────────────
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ── Multer config for product image uploads ────────────────────
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'kgl-shades',
        allowed_formats: ['jpeg', 'png', 'jpg', 'webp', 'gif', 'avif']
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// ── All admin routes require admin auth ────────────────────────
router.use(adminAuth);

// ── GET /api/admin/analytics → dashboard data
router.get('/analytics', getAnalytics);

// ── POST /api/admin/upload → upload a product image
// Returns the public path that can be used as mainImage in the product
router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
    }

    // req.file.path contains the secure URL returned by Cloudinary
    const imagePath = req.file.path;
    res.status(200).json({ imagePath });
});

module.exports = router;
