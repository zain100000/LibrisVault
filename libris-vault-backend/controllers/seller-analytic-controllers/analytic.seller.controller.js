const Order = require("../../models/order-models/order.model");
const Book = require("../../models/book-models/book.model");

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
    const { startDate, endDate, bookId, category } = req.query;

    const filter = { status: { $nin: ["CANCELLED", "REFUNDED"] } };

    filter.store = { $in: await getSellerStores(sellerId) };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (bookId) filter["items.book"] = bookId;

    if (category) {
      const categoryBooks = await Book.find({ category }, "_id");
      filter["items.book"] = { $in: categoryBooks.map((b) => b._id) };
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
 * @desc Get best-selling books with profit margins
 * @route GET /api/analytic/v1/seller/get-seller-best-selling-book
 * @access Private (Seller only)
 */
exports.getBestSellingBooks = async (req, res) => {
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
          from: "books",
          localField: "items.book",
          foreignField: "_id",
          as: "book",
        },
      },
      { $unwind: "$book" },
      {
        $group: {
          _id: "$book._id",
          title: { $first: "$book.title" },
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          profit: {
            $sum: {
              $multiply: [
                { $subtract: ["$items.price", "$book.costPrice"] },
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
      message: "Seller best selling books analytics fetched successfully!",
      bestSellingBooks: bestSellers,
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

    const books = await Book.find({ seller: sellerId })
      .populate("reviews.user", "userName email")
      .select("title reviews");

    return res.status(200).json({
      success: true,
      message: "Customer ratings and reviews fetched successfully!",
      sellerBookReviews: books,
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
