const express = require('express');
const router = express.Router();

// Import all order controller functions
const {
    getOrders,
    getOrderById,
    getOrdersByUser,
    createOrder,
    updateOrder,
    deleteOrder
} = require('../controllers/orderController');

// ── GET /api/orders      → fetch all orders
// ── POST /api/orders     → create a new order
router.route('/').get(getOrders).post(createOrder);

// ── GET /api/orders/user/:userId → fetch all orders belonging to a specific user
// NOTE: This route must be defined BEFORE '/:id' so Express doesn't
//       accidentally treat the string "user" as a MongoDB ObjectId
router.route('/user/:userId').get(getOrdersByUser);

// ── GET /api/orders/:id    → fetch one order by ID
// ── PUT /api/orders/:id    → update an order (e.g. change status)
// ── DELETE /api/orders/:id → delete/cancel an order
router.route('/:id').get(getOrderById).put(updateOrder).delete(deleteOrder);

module.exports = router;
