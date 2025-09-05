const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const reportController = require("../../controllers/report-controllers/report.controller");

/**
 * @description Route to get sales reports per seller.
 */
router.get("/super-admin/get-sale-report", authMiddleware, reportController.getSalesReport);

module.exports = router;
