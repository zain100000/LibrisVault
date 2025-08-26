const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authLimiter,
} = require("../../middlewares/auth.middleware");
const profilePictureUpload = require("../../utilities/cloudinary/cloudinary.utility");
const userController = require("../../controllers/user-controllers/user.controller");

//------------------------------ USER BASE ROUTES  ----------------------------------
//------------------------------ USER BASE ROUTES  ----------------------------------
//------------------------------ USER BASE ROUTES  ----------------------------------
//------------------------------ USER BASE ROUTES  ----------------------------------

/**
 * @description Routes for user signup
 */
router.post(
  "/signup-user",
  profilePictureUpload.upload,
  userController.registerUser
);

/**
 * @description Route for user signin
 */
router.post("/signin-user", authLimiter, userController.loginUser);

/**
 * @description Route to Get User details by ID
 */
router.get("/get-user-by-id/:id", authMiddleware, userController.getUserById);

/**
 * @description Route to Update User details by ID
 */
router.patch(
  "/update-user/:id",
  authMiddleware,
  profilePictureUpload.upload,
  userController.updateUser
);

/**
 * @description Route to Logout User
 */
router.post("/logout-user", authMiddleware, userController.logoutUser);

/**
 * @description Route to send email for password reset
 */

router.post("/forgot-password", userController.forgotPassword);

/**
 * @description Route to reset password with token
 */

router.post("/reset-password/:token", userController.resetPasswordWithToken);

/**
 * @description Route to verify reset token
 */

router.post("/verify-reset-token/:token", userController.verifyResetToken);

module.exports = router;
