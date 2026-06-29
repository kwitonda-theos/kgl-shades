const mongoose = require('mongoose');

const Collection = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    coverImage: { type: String, default: '' }, // optional — falls back to first product's lifestyleImage
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

module.exports = mongoose.model('Collection', Collection);
