const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'kgl-shades-secret-key-change-me';

// Middleware: verify the application's JWT and check that the user is an admin
const adminAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        let user = null;

        // 1. Attempt internal JWT verification
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            if (decoded.id) {
                user = await User.findById(decoded.id).select('-passwordHash');
            }
        } catch (jwtErr) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        if (!user) {
            return res.status(401).json({ message: 'User not found in system' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = adminAuth;
