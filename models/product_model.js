const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    // id: { type: String, unique: true },
    name: { type: String },
    description: { type: String },
    price: { type: Number, required: true, min:0 },
    stock: { type: Number, required: true, min:0 },
    deleted_at: { type: Date }

},{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
})

module.exports = mongoose.model('Product', productSchema);