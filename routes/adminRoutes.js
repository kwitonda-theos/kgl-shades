const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const adminAuth = require('../middleware/adminAuth');
const { getAnalytics } = require('../controllers/adminController');

// ── Multer config for product image uploads ────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Save uploads to the frontend's public/images folder
        // so Next.js can serve them as static files
        cb(null, path.join(__dirname, '..', 'frontend', 'public', 'images'));
    },
    filename: (req, file, cb) => {
        // Create unique filename: product-<timestamp>.<ext>
        const ext = path.extname(file.originalname);
        const name = `product-${Date.now()}${ext}`;
        cb(null, name);
    }
});

const fileFilter = (req, file, cb) => {
    // Only allow image files
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
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

    // Return the path relative to the public folder
    const imagePath = `/images/${req.file.filename}`;
    res.status(200).json({ imagePath });
});

module.exports = router;
