const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const ratingController = require("../../controllers/rating-controllers/rating-controller");

//------------------------------ RATING ROUTES  ----------------------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------

/**
 * @description Rate a book (1-5 stars)
 */
router.post("/add-rate", authMiddleware, ratingController.rateBook);

/**
 * @description Get book ratings
 */
router.get("/get-book-rating/:id", ratingController.getBookRatings);

/**
 * @description Get user's rating for a book
 */
router.get("/get-user-rating/:id", authMiddleware, ratingController.getUserRating);

/**
 * @description Delete user's rating
 */
router.delete(
  "/delete-rating/:id",
  authMiddleware,
  ratingController.deleteRating
);

/**
 * @description Get top rated books
 */
router.get("/get-top-rated", ratingController.getTopRatedBooks);

module.exports = router;
