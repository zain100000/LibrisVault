const Order = require("../../models/order-models/order.model");
const Inventory = require("../../models/inventory-models/inventory.model");

/**
 * @desc Get sales report for seller
 * @route GET /api/analytic/v1/seller/get-seller-sale-analytic
 * @access Private (Seller only)
 */
exports.getSalesReport = async (req, res) => {
  try {
    if (req.user.role !== "SELLER") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only Seller can get analytics.",
      });
    }

    const sellerId = req.user.id;
    const { startDate, endDate, inventoryId, category } = req.query;

    const filter = { status: { $nin: ["CANCELLED", "REFUNDED"] } };

    filter.store = { $in: await getSellerStores(sellerId) };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (inventoryId) filter["items.inventory"] = inventoryId;

    if (category) {
      const categoryInventory = await Inventory.find({ category }, "_id");
      filter["items.inventory"] = { $in: categoryInventory.map((i) => i._id) };
    }

    const sales = await Order.aggregate([
      { $match: filter },
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
          totalQuantity: { $sum: "$items.quantity" },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Seller sales analytics fetched successfully!",
      salesAnalytics: sales[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        totalQuantity: 0,
      },
    });
  } catch (err) {
    console.error("Error generating sales report:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Get best-selling inventory items with profit margins
 * @route GET /api/analytic/v1/seller/get-seller-best-selling-inventory
 * @access Private (Seller only)
 */
exports.getBestSellingInventory = async (req, res) => {
  try {
    if (req.user.role !== "SELLER") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only Seller can get analytics.",
      });
    }

    const sellerId = req.user.id;

    const filter = { status: { $nin: ["CANCELLED", "REFUNDED"] } };
    filter.store = { $in: await getSellerStores(sellerId) };

    const bestSellers = await Order.aggregate([
      { $match: filter },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "inventories",
          localField: "items.inventory",
          foreignField: "_id",
          as: "inventory",
        },
      },
      { $unwind: "$inventory" },
      {
        $group: {
          _id: "$inventory._id",
          title: { $first: "$inventory.title" },
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          profit: {
            $sum: {
              $multiply: [
                { $subtract: ["$items.price", "$inventory.costPrice"] },
                "$items.quantity",
              ],
            },
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    return res.status(200).json({
      success: true,
      message: "Seller best selling inventory analytics fetched successfully!",
      bestSellingInventory: bestSellers,
    });
  } catch (err) {
    console.error("Error fetching best sellers:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Get customer ratings & reviews
 * @route GET /api/analytic/v1/seller/get-customer-rating-reviews
 * @access Private (Seller only)
 */
exports.getCustomerReviews = async (req, res) => {
  try {
    if (req.user.role !== "SELLER") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only Seller can get analytics.",
      });
    }
    const sellerId = req.user.id;

    const inventory = await Inventory.find({ seller: sellerId })
      .populate("reviews.user", "userName email")
      .select("title reviews");

    return res.status(200).json({
      success: true,
      message: "Customer ratings and reviews fetched successfully!",
      sellerInventoryReviews: inventory,
    });
  } catch (err) {
    console.error("Error fetching reviews:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

async function getSellerStores(sellerId) {
  const Store = require("../../models/store-models/store.model");
  const stores = await Store.find({ seller: sellerId }, "_id");
  return stores.map((s) => s._id);
}
