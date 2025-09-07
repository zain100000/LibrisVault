const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const inventoryPictureUpload = require("../../utilities/cloudinary/cloudinary.utility");
const inventoryController = require("../../controllers/inventory-controllers/inventory.controller");

/**
 * @description Creates a new inventory item listing.
 */
router.post(
  "/upload-inventory",
  authMiddleware,
  inventoryPictureUpload.upload,
  inventoryController.uploadInventory
);

/**
 * @description Retrieves all inventory item listings.
 */
router.get(
  "/get-all-inventory",
  authMiddleware,
  inventoryController.getAllInventory
);

/**
 * @description Retrieves a single inventory item by its ID.
 */
router.get(
  "/get-inventory-by-id/:inventoryId",
  authMiddleware,
  inventoryController.getInventoryById
);

/**
 * @description Updates an inventory item's details by its ID.
 */
router.patch(
  "/update-inventory/:inventoryId",
  authMiddleware,
  inventoryPictureUpload.upload,
  inventoryController.updateInventory
);

/**
 * @description Deletes an inventory item by its ID.
 */
router.delete(
  "/delete-inventory/:inventoryId",
  authMiddleware,
  inventoryController.deleteInventory
);

/**
 * @description Creates a new inventory item listing by providing an ISBN.
 */
router.post(
  "/upload-inventory-by-isbn",
  authMiddleware,
  inventoryPictureUpload.upload,
  inventoryController.uploadInventoryByISBN
);

module.exports = router;
