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
        type: String
    },
    firstName: { type: String },
    lastName: { type: String },
    phone: {
        type: Number,
        required: true,
        validate: {
            validator: Number.isInteger,
            message: '{VAlUE} is not a number'
        }
    }
},{timestamps: true});

module.exports = mongoose.model('User', Users)