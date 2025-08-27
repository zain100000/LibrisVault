const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const reviewController = require("../../controllers/review-controllers/review.controller");

//------------------------------ REVIEW ROUTES  ----------------------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------

/**
 * @description Add Review 
 */
router.post("/add-review", authMiddleware, reviewController.addReview);

/**
 * @description Get Reviews of book
 */
router.get("/get-book-review/:id", reviewController.getReviews);

/**
 * @description Update Review 
 */
router.patch("/update-review/:id", authMiddleware, reviewController.updateReview);

/**
 * @description Delete Review 
 */
router.delete("/delete-review/:id", authMiddleware, reviewController.deleteReview);


module.exports = router;
