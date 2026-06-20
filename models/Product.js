const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  condition: { type: String, enum: ['Used', 'Like New', 'Refurbished', 'Good', 'Fair'], required: true },
  price: { type: Number, required: true },
  images: [{ type: String }],
  description: { type: String, required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['available', 'sold', 'rejected', 'pending'], default: 'available' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
