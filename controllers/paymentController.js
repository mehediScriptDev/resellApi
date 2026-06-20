const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Order = require('../models/Order');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body; // Amount in BDT
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amounts in cents/poisha
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
      buyerId: req.user._id
    });

    if (status === 'success') {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid' });
    }

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
