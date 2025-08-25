const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authLimiter,
} = require("../../middlewares/auth.middleware");
const storeLogoUpload = require("../../utilities/cloudinary/cloudinary.utility");
const storeController = require("../../controllers/store-controllers/store.controller");

/**
 * @description Route to create a new store
 */
router.post(
  "/:id/create-store",
  authMiddleware,
  storeLogoUpload.upload,
  storeController.createStore
);

/**
 *  @description Route to login to store
 */

router.post("/:id/login-store", authLimiter, storeController.loginStore);

/**
 * @description Route to get store details by ID
 */
router.get(
  "/:id/get-store-by-id/:id",
  authMiddleware,
  storeController.getStoreById
);

module.exports = router;
