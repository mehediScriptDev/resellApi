const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const { productId, sellerId, deliveryInfo, totalAmount } = req.body;
    const order = await Order.create({
      buyerId: req.user._id,
      sellerId,
      productId,
      deliveryInfo,
      totalAmount
    });
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user._id }).populate('productId', 'title images price');
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ sellerId: req.user._id }).populate('productId', 'title price').populate('buyerId', 'name email');
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    order.orderStatus = status;
    await order.save();
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
