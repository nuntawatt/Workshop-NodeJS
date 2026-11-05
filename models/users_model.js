const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    // id: { type: String, unique: true },
    username: { type: String },
    password: { type: String },
    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    },
    is_approve: { type: Boolean, default: false },
},{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

module.exports = mongoose.model('User', userSchema);