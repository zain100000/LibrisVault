const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authLimiter,
} = require("../../middlewares/auth.middleware");
const profilePictureUpload = require("../../utilities/cloudinary/cloudinary.utility");
const sellerController = require("../../controllers/seller-controllers/seller-controller");

/**
 * @description Route for seller registration.
 */
router.post(
  "/signup-seller",
  profilePictureUpload.upload,
  sellerController.registerSeller
);

/**
 * @description Route for seller sign-in.
 */
router.post("/signin-seller", authLimiter, sellerController.loginSeller);

/**
 * @description Route to get a seller's details by their ID.
 */
router.get(
  "/get-seller-by-id/:sellerId",
  authMiddleware,
  sellerController.getSellerById
);

/**
 * @description Route to update a seller's details.
 */
router.patch(
  "/update-seller/:sellerId",
  authMiddleware,
  profilePictureUpload.upload,
  sellerController.updateSeller
);

/**
 * @description Route to reset a seller's password.
 */
router.patch(
  "/reset-seller-password",
  authMiddleware,
  sellerController.resetSellerPassword
);

/**
 * @description Route for seller logout.
 */
router.post("/logout-seller", authMiddleware, sellerController.logoutSeller);

/**
 * @description Route to request account deletion.
 */
router.delete(
  "/request-deletion-account/:sellerId",
  authMiddleware,
  sellerController.requestSellerDeletion
);

/**
 * @description Route to send an email for a password reset.
 */
router.post("/forgot-password", sellerController.forgotPassword);

/**
 * @description Route to reset a password using a token.
 */
router.post("/reset-password/:token", sellerController.resetPasswordWithToken);

/**
 * @description Route to verify a password reset token.
 */
router.post("/verify-reset-token/:token", sellerController.verifyResetToken);

module.exports = router;
