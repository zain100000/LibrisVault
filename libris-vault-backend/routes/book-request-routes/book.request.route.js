const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const bookRequestController = require("../../controllers/book-request-controllers/book.request.controller");

/**
 * @description Creates a new book request. 
 */
router.post(
  "/create-request",
  authMiddleware,
  bookRequestController.requestBook
);

/**
 * @description Retrieves all book requests for a specific user.
 */
router.get(
  "/get-book-request/:userId",
  authMiddleware,
  bookRequestController.getRequests
);

/**
 * @description Updates the status of a specific book request.
 */
router.patch(
  "/update-request-status/:requestId",
  authMiddleware,
  bookRequestController.updateRequestStatus
);

module.exports = router;
