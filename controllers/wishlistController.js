const Wishlist = require('../models/Wishlist');

exports.getWishlist = async (req, res) => {
  try {
    const items = await Wishlist.find({ userId: req.user._id })
      .populate('productId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: items.map((item) => item.productId).filter(Boolean),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWishlistCount = async (req, res) => {
  try {
    const count = await Wishlist.countDocuments({ userId: req.user._id });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const existing = await Wishlist.findOne({ userId: req.user._id, productId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already in wishlist' });
    }

    const item = await Wishlist.create({ userId: req.user._id, productId });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndDelete({
      userId: req.user._id,
      productId: req.params.productId,
    });
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
