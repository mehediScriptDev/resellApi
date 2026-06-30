const Review = require('../models/Review');
const Product = require('../models/Product');

exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('reviewerId', 'name photo')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      success: true,
      data: reviews,
      averageRating: Number(avgRating.toFixed(1)),
      totalReviews: reviews.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const review = await Review.create({
      reviewerId: req.user._id,
      productId,
      rating,
      comment,
    });

    const populated = await Review.findById(review._id).populate('reviewerId', 'name photo');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You already reviewed this product' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
