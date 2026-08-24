const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('@clerk/backend');

const JWT_SECRET = process.env.JWT_SECRET || 'kgl-shades-secret-key-change-me';

// Middleware: verify JWT (internal or Clerk) and check that the user is an admin
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
            } else if (decoded.clerkId) {
                user = await User.findOne({ clerkId: decoded.clerkId }).select('-passwordHash');
            }
        } catch (jwtErr) {
            // 2. If internal JWT failed, attempt Clerk token verification
            const clerkSecret = process.env.CLERK_SECRET_KEY;
            if (clerkSecret) {
                try {
                    const verifiedClerk = await verifyToken(token, {
                        secretKey: clerkSecret,
                    });
                    if (verifiedClerk && verifiedClerk.sub) {
                        user = await User.findOne({ clerkId: verifiedClerk.sub }).select('-passwordHash');
                    }
                } catch (clerkErr) {
                    // Token invalid under both verifiers
                    return res.status(401).json({ message: 'Invalid or expired token' });
                }
            } else {
                return res.status(401).json({ message: 'Invalid or expired token' });
            }
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
