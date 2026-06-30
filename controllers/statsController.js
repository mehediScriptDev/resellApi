const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { DEFAULT_CATEGORIES } = require('../constants/categories');

exports.getPublicStats = async (req, res) => {
  try {
    const [totalProducts, totalSellers, totalBuyers, completedOrders] = await Promise.all([
      Product.countDocuments({ status: 'available' }),
      User.countDocuments({ role: 'seller', status: 'active' }),
      User.countDocuments({ role: 'buyer', status: 'active' }),
      Order.countDocuments({ orderStatus: 'delivered' }),
    ]);

    res.json({
      success: true,
      data: { totalProducts, totalSellers, totalBuyers, completedOrders },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCategoryStats = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { status: 'available' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const countMap = Object.fromEntries(
      categories.filter((c) => c._id).map((c) => [c._id, c.count])
    );

    const allNames = [
      ...DEFAULT_CATEGORIES,
      ...Object.keys(countMap).filter((name) => !DEFAULT_CATEGORIES.includes(name)),
    ];

    const data = allNames.map((name) => ({
      name,
      count: countMap[name] || 0,
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTopSellers = async (req, res) => {
  try {
    const sellers = await Product.aggregate([
      { $match: { status: 'available' } },
      { $group: { _id: '$sellerId', productCount: { $sum: 1 }, category: { $first: '$category' } } },
      { $sort: { productCount: -1 } },
      { $limit: 4 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'seller',
        },
      },
      { $unwind: '$seller' },
    ]);

    const data = await Promise.all(
      sellers.map(async (s) => {
        const orderCount = await Order.countDocuments({ sellerId: s._id, paymentStatus: 'paid' });
        return {
          _id: s.seller._id,
          name: s.seller.name,
          photo: s.seller.photo,
          category: s.category,
          productCount: s.productCount,
          salesCount: orderCount,
        };
      })
    );

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, totalRevenue, recentUsers, reportedProducts] =
      await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments(),
        Payment.aggregate([
          { $match: { paymentStatus: 'success' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        User.find().select('-password').sort({ createdAt: -1 }).limit(5),
        Product.find({ reportCount: { $gt: 0 } })
          .populate('sellerId', 'name')
          .sort({ reportCount: -1 })
          .limit(5),
      ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentUsers,
        reportedProducts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSellerAnalytics = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const [products, orders, paidOrders] = await Promise.all([
      Product.find({ sellerId }),
      Order.find({ sellerId }),
      Order.find({ sellerId, paymentStatus: 'paid' }),
    ]);

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
    const uniqueCustomers = new Set(paidOrders.map((o) => o.buyerId.toString())).size;
    const conversionRate =
      totalViews > 0 ? ((paidOrders.length / totalViews) * 100).toFixed(1) : '0.0';

    const monthlyRevenue = await Order.aggregate([
      { $match: { sellerId, paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalViews,
        uniqueCustomers,
        conversionRate,
        totalProducts: products.length,
        totalOrders: orders.length,
        monthlyRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminAnalytics = async (req, res) => {
  try {
    const [totalUsers, activeListings, completedOrders, revenue, monthlyUsers, monthlyOrders] =
      await Promise.all([
        User.countDocuments(),
        Product.countDocuments({ status: 'available' }),
        Order.countDocuments({ orderStatus: 'delivered' }),
        Payment.aggregate([
          { $match: { paymentStatus: 'success' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        User.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
          { $limit: 6 },
        ]),
        Order.aggregate([
          { $match: { paymentStatus: 'paid' } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
              revenue: { $sum: '$totalAmount' },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
          { $limit: 6 },
        ]),
      ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeListings,
        completedOrders,
        totalRevenue: revenue[0]?.total || 0,
        monthlyUsers,
        monthlyOrders,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
