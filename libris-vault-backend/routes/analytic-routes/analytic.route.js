const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const analyticController = require("../../controllers/analytic-controllers/analytic.controller");

/**
 * @description Route to get platform analytic.
 */
router.get(
  "/super-admin/get-platform-analytic",
  authMiddleware,
  analyticController.getPlatformAnalytics
);

/**
 * @description Route to get seller performance.
 */
router.get(
  "/super-admin/get-seller-performance-analytic",
  authMiddleware,
  analyticController.getSellerPerformance
);

/**
 * @description Route to get revenue report.
 */
router.get(
  "/super-admin/get-revenue-analytic",
  authMiddleware,
  analyticController.getRevenueReport
);

module.exports = router;
