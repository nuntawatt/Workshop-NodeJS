const express = require('express');
const router = express.Router();

const order = require('../models/order_model');

const {authenticateToken} = require('../middleware/auth');

// /api/v1/orders
// get order all admin
router.get('/', authenticateToken, async function(req, res) {
    try {
        const orders = await order.find()
            .populate('user_id', 'username')
            .populate('items.product_id', 'name')
            .sort({ created_at: -1 });

        return res.status(200).json({
            status: 200,
            message: 'Get orders successful',
            data: orders
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error'
        });
    }
});

module.exports = router;