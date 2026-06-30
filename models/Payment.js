const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  transactionId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['success', 'failed'], default: 'success' },
  paymentMethod: { type: String, default: 'card' },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
