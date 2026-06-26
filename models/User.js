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
    }
},{timestamps: true});

module.exports = mongoose.models.User || mongoose.model('User', Users);