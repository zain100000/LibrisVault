const User = require("../../models/user-models/user.model");
const Seller = require("../../models/seller-models/seller-model");
const Order = require("../../models/order-models/order.model");

/**
 * @desc Overall platform analytics
 * @route GET /api/analytic/super-admin/get-platform-analytic
 * @access Private (SuperAdmin only)
 */
exports.getPlatformAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only SuperAdmin can get analytics.",
      });
    }

    const totalUsers = await User.countDocuments();
    const totalSellers = await Seller.countDocuments();
    const totalOrders = await Order.countDocuments();

    const totalRevenueAgg = await Order.aggregate([
      { $match: { status: { $nin: ["CANCELLED", "REFUNDED"] } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;

    return res.status(200).json({
      success: true,
      message: "Platform analytics fetched successfully!",
      platformAnalytics: {
        totalUsers,
        totalSellers,
        totalOrders,
        totalRevenue,
      },
    });
  } catch (err) {
    console.error("Error fetching analytics:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Seller performance analytics
 * @route GET /api/analytic/super-admin/get-seller-performance
 * @access Private (SuperAdmin only)
 */
exports.getSellerPerformance = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only SuperAdmin can get analytics.",
      });
    }

    const sellers = await Order.aggregate([
      { $match: { status: { $nin: ["CANCELLED", "REFUNDED"] } } },
      {
        $group: {
          _id: "$store",
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      message: "Seller performance analytics fetched successfully!",
      sellerPerformanceAnalytics: sellers,
    });
  } catch (err) {
    console.error("Error fetching seller performance:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Revenue report with discounts/promotions impact
 * @route GET /api/analytic/uper-admin/get-revenue-report
 * @access Private (SuperAdmin only)
 */
exports.getRevenueReport = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only SuperAdmin can get analytics.",
      });
    }
    
    const report = await Order.aggregate([
      { $match: { status: { $nin: ["CANCELLED", "REFUNDED"] } } },
      {
        $project: {
          totalAmount: 1,
          discount: {
            $subtract: ["$items.price", "$items.discountPrice"],
          },
        },
      },
      {
        $group: {
          _id: null,
          grossSales: { $sum: "$totalAmount" },
          totalDiscounts: { $sum: { $ifNull: ["$discount", 0] } },
        },
      },
    ]);

    const data = {
      grossSales: report[0]?.grossSales || 0,
      totalDiscounts: report[0]?.totalDiscounts || 0,
      netSales: (report[0]?.grossSales || 0) - (report[0]?.totalDiscounts || 0),
    };

    return res.status(200).json({
      success: true,
      message: "Revenue analytics fetched successfully!",
      revenueAnalytics: data,
    });
  } catch (err) {
    console.error("Error fetching revenue report:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
