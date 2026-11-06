var express = require('express');
var router = express.Router();

const mongoose = require('mongoose')
const product = require('../models/product_model');

const {authenticateToken, authorizeAdmin} = require('../middleware/auth');


// get all products
router.get('/', authenticateToken, async function(req, res) {
try {
    
    // ค้นหา product โดยมีเงื่อนไขว่า delete ต้องเป็น null
    const products = await product.find({
        deleted_at: null
    }).sort({ created_at: -1 });

    return res.status(200).json({
        status: 200,
        massage: 'Get products success',
        data: products
    });


} catch (error) {
    console.log(error)
    res.status(500).send(error.message);
}
});

// get products by id
router.get('/:id', authenticateToken, async function(req, res) {
try {
    
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)){
        return res.status(400).json({
            status: 400,
            massage: 'Invalid product ID'
        });
    }

    const products = await product.findOne({
        _id: id,
        deleted_at: null
    });

    if (!products) {
        return res.status(404).json({
            status: 404,
            massage: 'Product not found'
        })
    }

    return res.status(200).json({
        status: 200,
        massage: 'Get product success',
        data: products
    });

} catch (error) {
    console.log(error)
    res.status(500).send(error.message);
}
});


// admin post products 
router.post('/', authenticateToken, authorizeAdmin, async function(req, res) {
try {
    
    const { name, description, price, stock } = req.body;

    if (!name || price == null || stock == null) {
        return res.status(400).json({
            status: 400,
            massage: 'Name, price and stock are required'
        });
    }


    // ตรวจสอบ price กับ stock ว่าเป็นตัวเลขที่ใช้ได้ และไม่ติดลบ
    if (
        !Number.isFinite(price) ||
        !Number.isFinite(stock) ||
        price < 0 ||
        stock < 0
    ) {
        return res.status(400).json({
            status: 400,
            massage: 'Invalid price or stock'
        });
    }

    const products = await product.create({
        name,
        description,
        price,
        stock
    });

    return res.status(201).json({
        status: 201,
        massage: 'Create product success',
        data: products
    });


} catch (error) {
    console.log(error)
    res.status(500).send(error.message);
}
});


// method update product
router.put('/:id', authenticateToken, authorizeAdmin,async function(req, res) {
try {
    
    const { id } = req.params;
    const { name, description, price, stock } = req.body;

    if(!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            status: 400,
            massage: 'Invalid product ID'
        });
    }

    if (price !== undefined && (typeof price !== 'number' || price < 0)){
        return res.status(400).json({
            status: 400,
            massage: 'Invalid price'
        })
    }
    if (stock !== undefined && (typeof stock !== 'number' || stock < 0)){
        return res.status(400).json({
            status: 400,
            massage: 'Invalid price'
        })
    }
    
    const products = await product.findOneAndUpdate(
        { _id: id, delete_at: null },
        { $set: { name, description, price, stock }},
        { new: true, runValidators: true}
    );

    if (!products) {
        return res.status(404).json({
            status: 404,
            massage: 'Product not found'
        });
    }

    return res.status(200).json({
        status: 200,
        massage: 'Update product success',
        data: products
    });

} catch (error) {
    console.log(error)
    res.status(500).send(error.message);
}
});


// method delete product by id
router.delete('/:id', authenticateToken, authorizeAdmin,async function(req, res) {
try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            status: 400,
            massage: 'Invalid product ID'
        })
    }

    const products = await product.findOneAndUpdate(
        { _id: id, deleted_at: null },
        { $set: {deleted_at: new Date()}},
        { new: true }
    );

    if (!products) {
        return res.status(404).json({
            status: 404,
            massage: 'Product not found'
        })
    }

    return res.status(200).json({
        status: 200,
        massage: 'Delete product success',
        data: products
    })
    

} catch (error) {
    console.log(error)
    res.status(500).send(error.message);
}
});

module.exports = router;