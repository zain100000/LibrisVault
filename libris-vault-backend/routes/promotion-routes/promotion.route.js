const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const promotionController = require("../../controllers/promotion-controllers/promotion.controller");

//------------------------------ SUPER ADMIN ROUTES  ----------------------------------
//------------------------------ SUPER ADMIN ROUTES  ----------------------------------
//------------------------------ SUPER ADMIN ROUTES  ----------------------------------
//------------------------------ SUPER ADMIN ROUTES  ----------------------------------

/**
 * @description Routes for Creating System-wide Promotions
 */
router.post(
  "/super-admin/create-promotion",
  authMiddleware,
  promotionController.createPromotion
);

/**
 * @description Route to Get Active System-wide Promotion
 */
router.get(
  "/get-active-system-wide-promotion",
  authMiddleware,
  promotionController.getActiveSystemWidePromotion
);

/**
 * @description Route to review seller promotions
 */

router.patch(
  "/super-admin/:id/review-seller-promotion",
  authMiddleware,
  promotionController.reviewSellerPromotion
);

//------------------------------ SELLER ROUTES  ----------------------------------
//------------------------------ SELLER ROUTES  ----------------------------------
//------------------------------ SELLER ROUTES  ----------------------------------
//------------------------------ SELLER ROUTES  ----------------------------------

/**
 * @description Routes for Creating Seller Promotions
 */
router.post(
  "/seller/create-seller-promotion",
  authMiddleware,
  promotionController.createSellerPromotion
);

module.exports = router;
