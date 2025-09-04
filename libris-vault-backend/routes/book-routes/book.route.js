const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const bookPictureUpload = require("../../utilities/cloudinary/cloudinary.utility");
const bookController = require("../../controllers/book-controllers/book.controller");

/**
 * @description Creates a new book listing.
 */
router.post(
  "/upload-book",
  authMiddleware,
  bookPictureUpload.upload,
  bookController.uploadBook
);

/**
 * @description Retrieves all book listings.
 */
router.get("/get-all-books", authMiddleware, bookController.getAllBooks);

/**
 * @description Retrieves a single book by its ID.
 */
router.get("/get-book/:bookId", authMiddleware, bookController.getBookById);

/**
 * @description Updates a book's details by its ID.
 */
router.patch(
  "/update-book/:bookId",
  authMiddleware,
  bookPictureUpload.upload,
  bookController.updateBook
);

/**
 * @description Deletes a book by its ID.
 */
router.delete(
  "/delete-book/:bookId",
  authMiddleware,
  bookController.deleteBook
);

/**
 * @description Creates a new book listing by providing an ISBN.
 */
router.post(
  "/upload-book-by-isbn",
  authMiddleware,
  bookPictureUpload.upload,
  bookController.uploadBookByISBN
);

module.exports = router;
