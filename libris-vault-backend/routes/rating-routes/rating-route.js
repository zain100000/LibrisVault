const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const ratingController = require("../../controllers/rating-controllers/rating-controller");

/**
 * @description Route to rate a book (1-5 stars).
 */
router.post("/add-rate", authMiddleware, ratingController.rateInventory);

/**
 * @description Route to get all ratings for a specific book.
 */
router.get("/get-book-rating/:bookId", ratingController.getInventoryRatings);

/**
 * @description Route to get a user's rating for a specific book.
 */
router.get(
  "/get-user-rating/:bookId",
  authMiddleware,
  ratingController.getUserRating
);

/**
 * @description Route to delete a user's rating.
 */
router.delete(
  "/delete-rating/:ratingId",
  authMiddleware,
  ratingController.deleteRating
);

/**
 * @description Route to get a list of top-rated books.
 */
router.get("/get-top-rated", ratingController.getTopRatedInventory);

module.exports = router;
