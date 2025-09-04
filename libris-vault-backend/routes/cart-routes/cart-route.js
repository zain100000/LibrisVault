const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const cartController = require("../../controllers/cart-controllers/cart-controller");

/**
 * @description Route to add a book to the user's cart.
 */
router.post("/add-to-cart", authMiddleware, cartController.addToCart);

/**
 * @description Route to remove a book from the user's cart.
 */
router.post("/remove-from-cart", authMiddleware, cartController.removeFromCart);

/**
 * @description Route to get all items in the user's cart.
 */
router.get("/get-cart", authMiddleware, cartController.getCart);

/**
 * @description Route to clear the entire cart for a user.
 */
router.delete("/clear-cart", authMiddleware, cartController.clearCart);

module.exports = router;
