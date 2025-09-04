const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const reviewController = require("../../controllers/review-controllers/review.controller");

/**
 * @description Route to add a new review for a book.
 */
router.post("/add-review", authMiddleware, reviewController.addReview);

/**
 * @description Route to get all reviews for a specific book.
 */
router.get("/get-book-review/:bookId", reviewController.getReviews);

/**
 * @description Route to update an existing review.
 */
router.patch(
  "/update-review/:reviewId",
  authMiddleware,
  reviewController.updateReview
);

/**
 * @description Route to delete a review.
 */
router.delete(
  "/delete-review/:reviewId",
  authMiddleware,
  reviewController.deleteReview
);

module.exports = router;
