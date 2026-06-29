const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, productId } = req.body;

    if (productId) {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'bdt',
      payment_method_types: ['card'],
    });

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.savePayment = async (req, res) => {
  try {
    const { orderId, transactionId, amount, status } = req.body;

    const payment = await Payment.create({
      orderId,
      transactionId,
      amount,
      paymentStatus: status,
      buyerId: req.user._id,
    });

    if (status === 'success') {
      const order = await Order.findByIdAndUpdate(
        orderId,
        { paymentStatus: 'paid' },
        { new: true }
      );
      if (order) {
        await Product.findByIdAndUpdate(order.productId, { status: 'sold' });
      }
    }

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBuyerPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ buyerId: req.user._id })
      .populate({
        path: 'orderId',
        populate: { path: 'productId', select: 'title images' },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('buyerId', 'name email')
      .populate({
        path: 'orderId',
        populate: { path: 'productId', select: 'title' },
      })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
