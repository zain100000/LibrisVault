const Order = require("../../models/order-models/order.model");
const mongoose = require("mongoose");
const {
  exportToExcel,
  exportToPDF,
} = require("../../helpers/report-exporter-helper/report.exporter.helper");

/**
 * @desc Get enhanced sales report
 * @route GET /api/report/super-admin/get-sale-report
 * @access Private (SUPERADMIN only)
 */
exports.getSalesReport = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only SuperAdmin can view reports.",
      });
    }

    let {
      period,
      startDate,
      endDate,
      sellerId,
      sortBy,
      sortOrder,
      page,
      limit,
      exportType,
    } = req.query;

    // Validate period
    const validPeriods = ["daily", "weekly", "monthly", "yearly"];
    if (!validPeriods.includes(period)) period = "daily";

    // Default date range → last 30 days
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Pagination defaults
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;
    const skip = (page - 1) * limit;

    // Sorting
    const sortField = sortBy || "totalSales";
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    // Period format
    let dateFormat;
    if (period === "daily") dateFormat = "%Y-%m-%d";
    else if (period === "weekly")
      dateFormat = "%Y-%U"; // year-week
    else if (period === "monthly") dateFormat = "%Y-%m";
    else if (period === "yearly") dateFormat = "%Y";

    // Aggregation pipeline
    const pipeline = [
      {
        $match: {
          status: "COMPLETED",
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $lookup: {
          from: "stores",
          localField: "store",
          foreignField: "_id",
          as: "store",
        },
      },
      { $unwind: "$store" },
    ];

    // Filter by seller if provided
    if (sellerId) {
      pipeline.push({
        $match: { "store.seller": new mongoose.Types.ObjectId(sellerId) },
      });
    }

    pipeline.push(
      {
        $group: {
          _id: {
            seller: "$store.seller",
            period: {
              $dateToString: { format: dateFormat, date: "$createdAt" },
            },
          },
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "sellers",
          localField: "_id.seller",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: "$seller" },
      {
        $project: {
          sellerId: "$seller._id",
          sellerName: "$seller.userName",
          sellerEmail: "$seller.email",
          period: "$_id.period",
          totalSales: 1,
          totalOrders: 1,
          _id: 0,
        },
      },
      { $sort: { [sortField]: sortDirection } },
      { $skip: skip },
      { $limit: limit }
    );

    const report = await Order.aggregate(pipeline);

    // ✅ Export as Excel or PDF
    if (exportType === "excel") {
      const filePath = await exportToExcel(
        report,
        `sales_report_${period}.xlsx`
      );
      return res.download(filePath);
    }

    if (exportType === "pdf") {
      const filePath = await exportToPDF(report, `sales_report_${period}.pdf`);
      return res.download(filePath);
    }

    return res.status(200).json({
      success: true,
      message: `${period} sales report fetched successfully`,
      page,
      limit,
      total: report.length,
      report,
    });
  } catch (err) {
    console.error("Error generating sales report:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
