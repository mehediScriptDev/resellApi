const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  photo: { type: String, default: 'https://i.pravatar.cc/300' },
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  phone: { type: String },
  location: { type: String },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
