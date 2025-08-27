const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const cartController = require("../../controllers/cart-controllers/cart-controller");

//------------------------------ CART ROUTES  ----------------------------------
//------------------------------ CART ROUTES  ----------------------------------
//------------------------------ CART ROUTES  ----------------------------------

/**
 * @description Route to add product to cart
 */
router.post("/add-to-cart", authMiddleware, cartController.addToCart);

/**
 * @description Route to remove product from cart
 */
router.post("/remove-from-cart", authMiddleware, cartController.removeFromCart);

/**
 * @description Route to get all cart items
 */
router.get("/get-cart", authMiddleware, cartController.getCart);

/**
 * @description Route to clear entire cart
 */
router.delete("/clear-cart", authMiddleware, cartController.clearCart);

module.exports = router;
