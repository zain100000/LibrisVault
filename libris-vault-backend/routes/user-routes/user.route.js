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

module.exports = router;
