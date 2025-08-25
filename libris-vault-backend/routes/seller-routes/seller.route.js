const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authLimiter,
} = require("../../middlewares/auth.middleware");
const profilePictureUpload = require("../../utilities/cloudinary/cloudinary.utility");
const sellerController = require("../../controllers/seller-controllers/seller-controller");

/**
 * @description Routes for Seller Signup
 */
router.post(
  "/signup-seller",
  profilePictureUpload.upload,
  sellerController.registerSeller
);

/**
 * @description Route for Seller Signin
 */
router.post("/signin-seller", authLimiter, sellerController.loginSeller);

/**
 * @description Route to Get Seller details by ID
 */
router.get(
  "/get-seller-by-id/:id",
  authMiddleware,
  sellerController.getSellerById
);

/**
 * @description Route to Update Seller details
 */

router.patch(
  "/update-seller/:id",
  authMiddleware,
  profilePictureUpload.upload,
  sellerController.updateSeller
);

/**
 * @description Route to Reset Seller Password
 */
router.patch(
  "/reset-seller-password",
  authMiddleware,
  sellerController.resetSellerPassword
);

/**
 * @description Route to Logout Seller
 */
router.post("/logout-seller", authMiddleware, sellerController.logoutSeller);

/**
 * @description Route to Delete Seller Account
 */

router.delete(
  "/request-deletion-account/:id",
  authMiddleware,
  sellerController.requestSellerDeletion
);

module.exports = router;
