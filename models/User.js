const mongoose = require('mongoose');

const Users = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    firstName: { type: String },
    lastName: { type: String },
    phone: {
        type: Number,
        required: true,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not a number'
        }
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    theme: {
        type: String,
        enum: ['dark', 'light'],
        default: 'dark'
    },
    cart: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            selectedLens: {
                id: String,
                name: String,
                priceUpcharge: Number,
                hex: String
            },
            quantity: { type: Number, default: 1 }
        }
    ]
},{timestamps: true});

module.exports = mongoose.models.User || mongoose.model('User', Users);