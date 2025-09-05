const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const sellerAnalyticController = require("../../controllers/seller-analytic-controllers/analytic.seller.controller");

/**
 * @description Route to get seller sales analytics.
 */
router.get(
  "/seller/get-seller-sale-analytic",
  authMiddleware,
  sellerAnalyticController.getSalesReport
);

/**
 * @description Route to get seller performance.
 */
router.get(
  "/seller/get-seller-best-selling-book",
  authMiddleware,
  sellerAnalyticController.getBestSellingBooks
);

/**
 * @description Route to get customer ratings and reviews.
 */
router.get(
  "/seller/get-customer-rating-reviews",
  authMiddleware,
  sellerAnalyticController.getCustomerReviews
);

module.exports = router;
