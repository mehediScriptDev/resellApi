const Order = require('../models/Order');
const Product = require('../models/Product');
const { DELIVERY_FEE, PLATFORM_FEE } = require('./productController');

exports.createOrder = async (req, res) => {
  try {
    const { productId, deliveryInfo, totalAmount } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Product is not available' });
    }
    if (product.sellerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot buy your own product' });
    }

    const calculatedTotal = product.price + DELIVERY_FEE + PLATFORM_FEE;
    const order = await Order.create({
      buyerId: req.user._id,
      sellerId: product.sellerId,
      productId,
      deliveryInfo,
      totalAmount: totalAmount || calculatedTotal,
    });

    const populated = await Order.findById(order._id)
      .populate('productId', 'title images price')
      .populate('sellerId', 'name email');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBuyerOrders = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { buyerId: req.user._id };

    const orders = await Order.find(query)
      .populate('productId', 'title images price')
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 });

    let filtered = orders;
    if (search) {
      const term = search.toLowerCase();
      filtered = orders.filter(
        (o) =>
          o.productId?.title?.toLowerCase().includes(term) ||
          o._id.toString().includes(term)
      );
    }

    res.json({ success: true, data: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSellerOrders = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = { sellerId: req.user._id };
    if (status && status !== 'all') query.orderStatus = status.toLowerCase();

    const orders = await Order.find(query)
      .populate('productId', 'title images price')
      .populate('buyerId', 'name email phone')
      .sort({ createdAt: -1 });

    let filtered = orders;
    if (search) {
      const term = search.toLowerCase();
      filtered = orders.filter(
        (o) =>
          o.productId?.title?.toLowerCase().includes(term) ||
          o.buyerId?.name?.toLowerCase().includes(term) ||
          o._id.toString().includes(term)
      );
    }

    res.json({ success: true, data: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};
    if (status && status !== 'all') query.orderStatus = status.toLowerCase();

    const orders = await Order.find(query)
      .populate('productId', 'title price')
      .populate('buyerId', 'name email')
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 });

    let filtered = orders;
    if (search) {
      const term = search.toLowerCase();
      filtered = orders.filter((o) => o._id.toString().includes(term));
    }

    res.json({ success: true, data: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (
      order.sellerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    order.orderStatus = status;
    if (status === 'delivered') {
      await Product.findByIdAndUpdate(order.productId, { status: 'sold' });
    }
    await order.save();

    const populated = await Order.findById(order._id)
      .populate('productId', 'title images price')
      .populate('buyerId', 'name email')
      .populate('sellerId', 'name email');

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
