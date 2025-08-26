const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const bookPictureUpload = require("../../utilities/cloudinary/cloudinary.utility");
const bookController = require("../../controllers/book-controllers/book.controller");

//------------------------------ SELLER ACTION ROUTES  ----------------------------------
//------------------------------ SELLER ACTION ROUTES  ----------------------------------
//------------------------------ SELLER ACTION ROUTES  ----------------------------------
//------------------------------ SELLER ACTION ROUTES  ----------------------------------

/**
 * @description Route to upload a new book
 */
router.post(
  "/book/upload-book",
  authMiddleware,
  bookPictureUpload.upload,
  bookController.uploadBook
);

/**
 * @description Route to get all books
 */

router.get("/book/get-all-books", authMiddleware, bookController.getAllBooks);

/**
 * @description Route to get a book by its ID
 */
router.get(
  "/book/get-book-by-id/:id",
  authMiddleware,
  bookController.getBookById
);

/**
 * @description Route to update a book by its ID
 */
router.patch(
  "/book/update-book/:id",
  authMiddleware,
  bookPictureUpload.upload,
  bookController.updateBook
);

/**
 * @description Route to delete a book by its ID
 */
router.delete(
  "/book/delete-book/:id",
  authMiddleware,
  bookController.deleteBook
);

/**
 * @description Route to add book by ISBN
 */
router.post(
  "/book/upload-book-by-isbn",
  authMiddleware,
  bookPictureUpload.upload,
  bookController.uploadBookByISBN
);

module.exports = router;
