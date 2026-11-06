const express = require('express');

// mergeParams: ให้อ่าน :product_id จาก URL ของ router แม่ได้
const router = express.Router({ mergeParams: true });

const mongoose = require('mongoose');
const order = require('../models/order_model');
const product = require('../models/product_model');

const {authenticateToken} = require('../middleware/auth');

// /api/v1/products/:product_id/orders
// method get order on product
router.get('/', authenticateToken, async function(req, res) {
    try {
        const { product_id } = req.params;

        if (!mongoose.isValidObjectId(product_id)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid product ID'
            });
        }

        const productExists = await product.exists({
            _id: product_id,
            deleted_at: null
        });

        if (!productExists) {
            return res.status(404).json({
                status: 404,
                message: 'Product not found'
            });
        }

        const orders = await order.find({ 'product_id': product_id })
            .populate('user_id', 'username')
            .sort({ created_at: -1 });

        return res.status(200).json({
            status: 200,
            message: 'Get product orders successful',
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


// /api/v1/products/:product_id/orders
// method add order on product (เพิ่มออเดอร์ใน Product)
router.post('/', authenticateToken, async function(req, res) {
    try {
        const { product_id } = req.params;
        const { quantity } = req.body;

        if (!mongoose.isValidObjectId(product_id)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid product ID'
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                status: 400,
                message: 'Quantity must be an integer greater than or equal to 1'
            });
        }

        // Order ไม่เกิน Stock จะเช็คและตัด stock
        const products = await product.findOneAndUpdate(
            { _id: product_id, deleted_at: null, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } },
            { new: true }
        );

        if (!products) {
            return res.status(400).json({
                status: 400,
                message: 'Product not found or insufficient stock'
            });
        }

        const orders = await order.create({
            user_id: req.user._id,
            product_id: products._id,
            quantity,
            price: products.price,
            total_price: products.price * quantity
        });

        return res.status(201).json({
            status: 201,
            message: 'Create order successful',
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