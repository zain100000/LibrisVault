const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authLimiter,
} = require("../../middlewares/auth.middleware");
const profilePictureUpload = require("../../utilities/cloudinary/cloudinary.utility");
const userController = require("../../controllers/user-controllers/user.controller");

/**
 * @description Route for user registration.
 */
router.post(
  "/signup-user",
  profilePictureUpload.upload,
  userController.registerUser
);

/**
 * @description Route for user sign-in.
 */
router.post("/signin-user", authLimiter, userController.loginUser);

/**
 * @description Route to get a user's details by ID.
 */
router.get(
  "/get-user-by-id/:userId",
  authMiddleware,
  userController.getUserById
);

/**
 * @description Route to update a user's details by ID.
 */
router.patch(
  "/update-user/:userId",
  authMiddleware,
  profilePictureUpload.upload,
  userController.updateUser
);

/**
 * @description Route for user logout.
 */
router.post("/logout-user", authMiddleware, userController.logoutUser);

/**
 * @description Route to send an email for a password reset.
 */
router.post("/forgot-password", userController.forgotPassword);

/**
 * @description Route to reset a password using a token.
 */
router.post("/reset-password/:token", userController.resetPasswordWithToken);

/**
 * @description Route to verify a password reset token.
 */
router.post("/verify-reset-token/:token", userController.verifyResetToken);

module.exports = router;
