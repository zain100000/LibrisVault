const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const orderController = require("../../controllers/order-controller/order.controller");

/**
 * @description Route to place a new order.
 */
router.post("/place-order", authMiddleware, orderController.placeOrder);

/**
 * @description Route to get all orders.
 */
router.get("/get-all-orders", authMiddleware, orderController.getAllOrders);

/**
 * @description Route to cancel an order.
 */
router.patch(
  "/cancel-order/:orderId",
  authMiddleware,
  orderController.cancelOrder
);

/**
 * @description Route to update the status of an order for a seller.
 */
router.patch(
  "/seller/update-order-status/:orderId",
  authMiddleware,
  orderController.updateOrderStatus
);

module.exports = router;
