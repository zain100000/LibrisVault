const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const orderController = require("../../controllers/order-controller/order.controller");

/**
 * @description Route to place new order
 */
router.post("/place-order", authMiddleware, orderController.placeOrder);

module.exports = router;
