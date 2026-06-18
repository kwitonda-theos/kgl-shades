const Order = require('../models/Orders');

// ============================================================
// @desc    Get all orders
// @route   GET /api/orders
// @access  Public (would normally be admin-only)
// ============================================================
const getOrders = async (req, res) => {
    try {
        // .populate('user') replaces the user ObjectId with the actual user document
        // .populate('items.product') does the same for each product inside order items
        // This is similar to Django's select_related / prefetch_related
        const orders = await Order.find({})
            .populate('user', 'firstName lastName email')     // only grab these user fields
            .populate('items.product', 'name basePrice');     // only grab these product fields

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Get a single order by its MongoDB _id
// @route   GET /api/orders/:id
// @access  Public
// ============================================================
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'firstName lastName email')
            .populate('items.product', 'name basePrice mainImage');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Get all orders for a specific user
// @route   GET /api/orders/user/:userId
// @access  Public
// ============================================================
const getOrdersByUser = async (req, res) => {
    try {
        // Filter orders where the 'user' field matches the userId from the URL
        const orders = await Order.find({ user: req.params.userId })
            .populate('items.product', 'name basePrice')
            .sort({ createdAt: -1 });   // newest orders first

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Create a new order
// @route   POST /api/orders
// @access  Public
// @body    { user, totalAmount, items: [{ product, lensOptionId, quantity }] }
// ============================================================
const createOrder = async (req, res) => {
    try {
        const { user, totalAmount, items } = req.body;

        // Validate that the order has at least one item
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'An order must have at least one item' });
        }

        // Create the order — status defaults to 'PENDING' (set in the schema)
        // items is an array of embedded orderItem sub-documents
        const order = await Order.create({
            user,
            totalAmount,
            items
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Update an order's status (e.g. PENDING → PAID → SHIPPED)
// @route   PUT /api/orders/:id
// @access  Public (would normally be admin-only)
// ============================================================
const updateOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }   // runValidators enforces the enum on status
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Delete / cancel an order
// @route   DELETE /api/orders/:id
// @access  Public
// ============================================================
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getOrders,
    getOrderById,
    getOrdersByUser,
    createOrder,
    updateOrder,
    deleteOrder
};
