const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const promotionController = require("../../controllers/promotion-controllers/promotion.controller");

/**
 * @description Route for creating system-wide promotions.
 */
router.post(
  "/super-admin/create-promotion",
  authMiddleware,
  promotionController.createPromotion
);

/**
 * @description Route to get an active system-wide promotion.
 */
router.get(
  "/get-active-system-wide-promotion",
  authMiddleware,
  promotionController.getActiveSystemWidePromotion
);

/**
 * @description Route to review a seller's promotion.
 */
router.patch(
  "/super-admin/review-seller-promotion/:promotionId",
  authMiddleware,
  promotionController.reviewSellerPromotion
);

/**
 * @description Route for creating a seller's promotion.
 */
router.post(
  "/seller/create-seller-promotion",
  authMiddleware,
  promotionController.createSellerPromotion
);

module.exports = router;
