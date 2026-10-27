const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: false
    },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    phone: {
        type: String,
        default: ''
    },
    imageUrl: {
        type: String,
        default: ''
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
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);