const mongoose = require('mongoose');

// Embedded Schema for Order Items
const orderItemSchema = new mongoose.Schema({
  quantity: { type: Number, default: 1, min: 1 },
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  lensOptionId: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true
    // We just store the ID here. If you need the lens details later, 
    // you populate the product and find the matching lens by ID.
  }
});

const orderSchema = new mongoose.Schema({
  
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    default: 'PENDING',
    enum: ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'] // Good practice to restrict statuses
  },
  
  // Relation
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // Embedding the order items directly
  items: [orderItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);