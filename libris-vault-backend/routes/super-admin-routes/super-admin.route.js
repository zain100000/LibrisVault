const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authLimiter,
} = require("../../middlewares/auth.middleware");
const profilePictureUpload = require("../../utilities/cloudinary/cloudinary.utility");
const superAdminController = require("../../controllers/super-admin-controllers/super-admin.controller");

// ------------------------------ SUPER ADMIN BASE ROUTES  ----------------------------------
// ------------------------------ SUPER ADMIN BASE ROUTES  ----------------------------------
// ------------------------------ SUPER ADMIN BASE ROUTES  ----------------------------------
// ------------------------------ SUPER ADMIN BASE ROUTES  ----------------------------------

/**
 * @description Routes for Super Admin functionalities
 */
router.post(
  "/signup-super-admin",
  profilePictureUpload.upload,
  superAdminController.registerSuperAdmin
);

/**
 * @description Route for Super Admin login
 */
router.post(
  "/signin-super-admin",
  authLimiter,
  superAdminController.loginSuperAdmin
);

/**
 * @description Route to Get Super Admin details by ID
 */
router.get(
  "/get-super-admin-by-id/:id",
  authMiddleware,
  superAdminController.getSuperAdminById
);

/**
 * @description Route to Reset Super Admin Password
 */
router.patch(
  "/reset-super-admin-password",
  authMiddleware,
  superAdminController.resetSuperAdminPassword
);

/**
 * @description Route to Logout Super Admin
 */
router.post(
  "/logout-super-admin",
  authMiddleware,
  superAdminController.logoutSuperAdmin
);

// ------------------------------ SUPER ADMIN ACTION ROUTES  ----------------------------------
// ------------------------------ SUPER ADMIN ACTION ROUTES  ----------------------------------
// ------------------------------ SUPER ADMIN ACTION ROUTES  ----------------------------------
// ------------------------------ SUPER ADMIN ACTION ROUTES  ----------------------------------

/**
 * @description Routes for Approving or Rejecting Seller Accounts
 */

router.delete(
  "/approve-seller-account-deletion/:id",
  authMiddleware,
  superAdminController.approveSellerAccountDeletion
);

/**
 * @description Route for Updating Seller Account Status (Suspend/Ban)
 */

router.patch(
  "/update-seller-status/:id",
  authMiddleware,
  superAdminController.updateSellerStatus
);

/**
 * @description Get all sellers with optional filters
 */

router.get(
  "/get-all-sellers",
  authMiddleware,
  superAdminController.getAllSellers
);

/**
 * @description Update the status of a seller's store (approve, suspend, etc.)
 */
router.patch(
  "/update-seller-store-status/:id",
  authMiddleware,
  superAdminController.updateStoreStatus
);

module.exports = router;
