const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const orderController = require("../../controllers/order-controller/order.controller");

/**
 * @description Route to place new order
 */
router.post("/place-order", authMiddleware, orderController.placeOrder);

/**
 * @description Route to get all orders
 */
router.get("/get-all-orders", authMiddleware, orderController.getAllOrders);

/**
 * @description Route to cancel the order
 */
router.patch("/cancel-order/:id", authMiddleware, orderController.cancelOrder);

module.exports = router;
