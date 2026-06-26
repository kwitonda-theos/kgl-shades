const Order = require('../models/Orders');
const User = require('../models/user');
const Product = require('../models/Products');

// ============================================================
// @desc    Get analytics dashboard data
// @route   GET /api/admin/analytics
// @access  Admin only
// ============================================================
const getAnalytics = async (req, res) => {
    try {
        // Run all queries in parallel for speed
        const [
            totalUsers,
            totalOrders,
            revenueResult,
            ordersByStatus,
            topProducts,
            revenueOverTime,
            recentOrders
        ] = await Promise.all([
            // 1. Total users count
            User.countDocuments({}),

            // 2. Total orders count
            Order.countDocuments({}),

            // 3. Total revenue (sum of all order totalAmount)
            Order.aggregate([
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),

            // 4. Orders grouped by status
            Order.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),

            // 5. Top 5 best-selling products by quantity ordered
            Order.aggregate([
                { $unwind: '$items' },
                {
                    $group: {
                        _id: '$items.product',
                        totalQuantity: { $sum: '$items.quantity' }
                    }
                },
                { $sort: { totalQuantity: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 1,
                        totalQuantity: 1,
                        productName: { $ifNull: ['$product.name', 'Deleted Product'] },
                        productImage: '$product.mainImage'
                    }
                }
            ]),

            // 6. Revenue over time (last 30 days, grouped by day)
            Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                        },
                        revenue: { $sum: '$totalAmount' },
                        orders: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),

            // 7. Recent 10 orders
            Order.find({})
                .populate('user', 'firstName lastName email')
                .populate('items.product', 'name basePrice mainImage')
                .sort({ createdAt: -1 })
                .limit(10)
        ]);

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Transform ordersByStatus into an object: { PENDING: 5, PAID: 3, ... }
        const statusMap = {};
        ordersByStatus.forEach(s => {
            statusMap[s._id] = s.count;
        });

        res.status(200).json({
            kpis: {
                totalUsers,
                totalOrders,
                totalRevenue,
                avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
            },
            ordersByStatus: statusMap,
            topProducts,
            revenueOverTime,
            recentOrders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAnalytics
};
