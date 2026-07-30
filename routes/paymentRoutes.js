const express = require('express');
const router = express.Router();
const Flutterwave = require('flutterwave-node-v3');
const Order = require('../models/Orders');
const crypto = require('crypto');

// Lazy-initialize the Flutterwave SDK (avoids crash if env vars load late)
let flw = null;
function getFlw() {
    if (!flw) {
        const pubKey = process.env.FLW_PUBLIC_KEY;
        const secKey = process.env.FLW_SECRET_KEY;
        if (!pubKey || !secKey) {
            throw new Error(
                'Flutterwave keys not found. Make sure FLW_PUBLIC_KEY and FLW_SECRET_KEY are set in your .env file.'
            );
        }
        flw = new Flutterwave(pubKey, secKey);
    }
    return flw;
}

// ============================================================
// @desc    Initiate a Mobile Money payment for Rwanda
// @route   POST /api/payments/initiate
// @access  Private (requires logged-in user)
// @body    { items, totalAmount, phone }
// ============================================================
const initiatePayment = async (req, res) => {
    try {
        const { items, totalAmount, phone } = req.body;

        // Validate inputs
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Order must have at least one item' });
        }
        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required' });
        }
        if (!totalAmount || totalAmount <= 0) {
            return res.status(400).json({ message: 'Invalid total amount' });
        }

        // We need user info — get it from the token
        // The order routes don't use auth middleware, but payments should.
        // For now we accept userId in the body (same pattern as createOrder)
        const { user: userId, email, fullname } = req.body;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Generate a unique transaction reference
        const txRef = `KGL-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

        // 1. Create the order in our DB with status PENDING
        const order = await Order.create({
            user: userId,
            totalAmount,
            items,
            txRef,
            phone,
            status: 'PENDING'
        });

        // 2. Initiate the Flutterwave Rwanda Mobile Money charge
        const payload = {
            phone_number: phone,
            amount: totalAmount,
            currency: 'RWF',
            email: email || 'customer@kglshades.com',
            tx_ref: txRef,
            fullname: fullname || 'KGL Customer',
            order_id: order._id.toString()
        };

        const response = await getFlw().MobileMoney.rwanda(payload);

        if (response.status === 'success') {
            res.status(200).json({
                status: 'pending',
                message: 'Payment initiated. Check your phone to approve.',
                txRef,
                orderId: order._id,
                flutterwaveResponse: response
            });
        } else {
            // Payment initiation failed — mark order as cancelled
            order.status = 'CANCELLED';
            await order.save();

            res.status(400).json({
                status: 'failed',
                message: response.message || 'Failed to initiate payment. Please try again.',
                details: response
            });
        }
    } catch (error) {
        console.error('Payment initiation error:', error);
        res.status(500).json({ message: error.message || 'Payment initiation failed' });
    }
};

// ============================================================
// @desc    Verify a payment status by tx_ref
// @route   GET /api/payments/verify/:txRef
// @access  Public
// ============================================================
const verifyPayment = async (req, res) => {
    try {
        const { txRef } = req.params;

        // Find the order by txRef
        const order = await Order.findOne({ txRef });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // If already paid, just return the status
        if (order.status === 'PAID') {
            return res.status(200).json({
                status: 'paid',
                orderId: order._id,
                txRef
            });
        }

        // Ask Flutterwave for the transaction status
        // We need the flutterwave transaction ID. If we have it, verify directly.
        // Otherwise, fetch by tx_ref via the Flutterwave API
        try {
            const response = await getFlw().Transaction.verify_by_tx_ref({ tx_ref: txRef });

            if (response?.data?.status === 'successful' &&
                response.data.currency === 'RWF' &&
                response.data.amount >= order.totalAmount) {

                // Payment verified — update order
                order.status = 'PAID';
                order.flutterwaveId = response.data.id?.toString();
                await order.save();

                return res.status(200).json({
                    status: 'paid',
                    orderId: order._id,
                    txRef
                });
            } else if (response?.data?.status === 'failed') {
                order.status = 'CANCELLED';
                await order.save();

                return res.status(200).json({
                    status: 'failed',
                    orderId: order._id,
                    txRef
                });
            }
        } catch (verifyError) {
            // If verification fails (e.g. not found yet), payment is still pending
            console.log('Verify check pending:', verifyError.message);
        }

        // Still pending
        return res.status(200).json({
            status: 'pending',
            orderId: order._id,
            txRef
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// @desc    Flutterwave webhook — called by Flutterwave on payment events
// @route   POST /api/payments/webhook
// @access  Public (verified by secret hash)
// ============================================================
const webhook = async (req, res) => {
    try {
        // Verify the webhook came from Flutterwave
        const secretHash = process.env.FLW_WEBHOOK_SECRET;
        const signature = req.headers['verif-hash'];

        if (secretHash && signature !== secretHash) {
            // Not from Flutterwave — reject
            return res.status(401).json({ message: 'Invalid webhook signature' });
        }

        const payload = req.body;

        // We only care about successful charge events
        if (payload.event === 'charge.completed' && payload.data) {
            const { tx_ref, status, id } = payload.data;

            const order = await Order.findOne({ txRef: tx_ref });
            if (order && order.status === 'PENDING') {
                if (status === 'successful') {
                    order.status = 'PAID';
                    order.flutterwaveId = id?.toString();
                    await order.save();
                    console.log(`✅ Order ${order._id} marked as PAID via webhook`);
                } else {
                    order.status = 'CANCELLED';
                    await order.save();
                    console.log(`❌ Order ${order._id} payment failed via webhook`);
                }
            }
        }

        // Always respond 200 to Flutterwave
        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(200).json({ status: 'ok' }); // Still 200 so Flutterwave doesn't retry
    }
};

// ── Routes ─────────────────────────────────────────────────────
router.post('/initiate', initiatePayment);
router.get('/verify/:txRef', verifyPayment);
router.post('/webhook', webhook);

module.exports = router;
