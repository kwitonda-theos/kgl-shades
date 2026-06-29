const mongoose = require('mongoose');

const lensOptions = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String,required : true},
    priceUpcharge: { type: Number, required: true, default: 0 }
})
const Products = new mongoose.Schema({
    name: {type: String,required: true},
    basePrice: {type: Number, required: true},
    mainImage: {type: String, required: true},
    lifestyleImage: {type: String,required: true},

    // embed lens options
    lensOption: [lensOptions]
}, {timestamps: true});

module.exports = mongoose.model('Product', Products);