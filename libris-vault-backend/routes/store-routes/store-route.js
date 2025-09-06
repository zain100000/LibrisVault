const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authLimiter,
} = require("../../middlewares/auth.middleware");
const storeLogoUpload = require("../../utilities/cloudinary/cloudinary.utility");
const storeController = require("../../controllers/store-controllers/store.controller");

/**
 * @description Route to create a new store.
 */
router.post(
  "/:sellerId/create-store",
  authMiddleware,
  storeLogoUpload.upload,
  storeController.createStore
);

/**
 * @description Route to log in to a store.
 */
router.post("/login-store", authLimiter, storeController.loginStore);

/**
 * @description Route to get store details by ID.
 */
router.get(
  "/get-store-by-id/:storeId",
  authMiddleware,
  storeController.getStoreById
);

module.exports = router;
