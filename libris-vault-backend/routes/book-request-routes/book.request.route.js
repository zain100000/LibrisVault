const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const bookRequestController = require("../../controllers/book-request-controllers/book.request.controller");

//------------------------------ BOOK REQUEST ROUTES  ----------------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------

/**
 * @description Create Book Request
 */
router.post(
  "/create-request",
  authMiddleware,
  bookRequestController.requestBook
);

/**
 * @description Get User Book Requests
 */
router.get(
  "/get-book-request/:id",
  authMiddleware,
  bookRequestController.getRequests
);

/**
 * @description Update User Request Status
 */
router.patch(
  "/update-request-status/:id",
  authMiddleware,
  bookRequestController.updateRequestStatus
);

module.exports = router;
