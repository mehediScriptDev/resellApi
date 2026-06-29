const Product = require('../models/Product');

const DELIVERY_FEE = 120;
const PLATFORM_FEE = 50;

exports.getProducts = async (req, res) => {
  try {
    const { search, category, sort, page = 1, limit = 10 } = req.query;
    let query = { status: 'available' };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'All') {
      query.category = category;
    }

    let sortObj = {};
    if (sort === 'price-low') sortObj.price = 1;
    else if (sort === 'price-high') sortObj.price = -1;
    else sortObj.createdAt = -1;

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate('sellerId', 'name email phone location')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'sellerId',
      'name email phone location photo'
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.incrementViews = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSellerProducts = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { sellerId: req.user._id };
    if (search) query.title = { $regex: search, $options: 'i' };

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminProducts = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (status && status !== 'all') {
      if (status === 'reported') query.reportCount = { $gt: 0 };
      else query.status = status;
    }

    const products = await Product.find(query)
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      sellerId: req.user._id,
      status: 'pending',
    });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (product.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.moderateProduct = async (req, res) => {
  try {
    const { status } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('sellerId', 'name email');

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (product.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFees = (req, res) => {
  res.json({ success: true, data: { deliveryFee: DELIVERY_FEE, platformFee: PLATFORM_FEE } });
};

exports.DELIVERY_FEE = DELIVERY_FEE;
exports.PLATFORM_FEE = PLATFORM_FEE;
