const mongoose = require("mongoose");
const axios = require("axios");
const Book = require("../../models/book-models/book.model");
const Seller = require("../../models/seller.models/seller-model");
const cloudinaryUpload = require("../../utilities/cloudinary/cloudinary.utility");

// ------------------------------ SELLER ACTION FUNCTIONS  ----------------------------------
// ------------------------------ SELLER ACTION FUNCTIONS  ----------------------------------
// ------------------------------ SELLER ACTION FUNCTIONS  ----------------------------------
// ------------------------------ SELLER ACTION FUNCTIONS  ----------------------------------

/**
 * @description Controller to add a new book
 * @route POST /api/inventory/book/upload-book
 * @access Private (Seller)
 */
exports.uploadBook = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // SELLER check
    if (!req.user || req.user.role !== "SELLER") {
      console.log("❌ Unauthorized update attempt");
      return res.status(403).json({
        success: false,
        message: "Unauthorized! only seller can update books.",
      });
    }

    const {
      title,
      author,
      price,
      stock,
      isbn,
      language,
      description,
      genre,
      publicationYear,
      publisher,
      pages,
    } = req.body;

    if (!req.files?.bookCover) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Book cover image is required",
      });
    }

    const bookCoverUploadResult = await cloudinaryUpload.uploadToCloudinary(
      req.files.bookCover[0],
      "bookCover"
    );

    const book = new Book({
      bookCover: bookCoverUploadResult.url,
      title,
      author,
      price,
      stock,
      isbn,
      language,
      description,
      genre: genre ? genre.split(",") : [],
      publicationYear,
      publisher,
      pages,
      seller: req.user.id,
    });

    await book.save({ session });

    await Seller.findByIdAndUpdate(
      req.user.id,
      { $push: { inventory: book._id } },
      { session, new: true }
    );

    await session.commitTransaction();
    session.endSession();

    if (book.stock === 0) {
      console.log(`🚨 Book "${book.title}" is OUT OF STOCK!`);
    } else if (book.stock <= (book.lowStockThreshold || 5)) {
      console.log(`⚠️ Book "${book.title}" is LOW ON STOCK: ${book.stock}`);
    }

    res.status(200).json({
      success: true,
      message: "Book added successfully",
      book,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error adding book:", error);

    if (error.code === 11000 && error.keyPattern?.isbn) {
      return res.status(409).json({
        success: false,
        message: "Book with this ISBN already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @description Controller to get all books
 * @route GET api/inventory/book/get-all-books
 * @access Public
 */

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().populate("seller");

    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Books found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Books fetched successfully",
      books: books,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @description Controller to get a book by ID
 * @route GET api/inventory/book/get-book-by-id/:id
 * @access Public
 */
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const books = await Book.findById(id).select("-title");
    if (!books) {
      return res.status(404).json({
        success: false,
        message: "Book Not Found!",
      });
    }

    res.json({
      success: true,
      message: "Book Fetched Successfully",
      book: books,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error Getting Book!",
    });
  }
};

/**
 * @description Controller to update a book by ID
 * @route PUT api/inventory/book/update-book/:id
 * @access Private (Seller)
 */
exports.updateBook = async (req, res) => {
  try {
    console.log("=== UPDATE BOOK START ===");
    console.log("User:", req.user);
    console.log("Params:", req.params);
    console.log("Body (raw):", req.body);
    console.log("Files:", req.files);

    if (!req.user || req.user.role !== "SELLER") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only Seller can update books.",
      });
    }

    const { id } = req.params;

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found!",
      });
    }

    const allowedFields = [
      "title",
      "author",
      "price",
      "stock",
      "isbn",
      "language",
      "description",
      "genre",
      "publicationYear",
      "publisher",
      "pages",
    ];

    let updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        updates[field] =
          field === "genre"
            ? req.body[field]
                .split(",")
                .map((g) => g.trim())
                .filter((g) => g)
            : req.body[field];
      }
    }

    if (req.files?.bookCover) {
      const bookCoverUploadResult = await cloudinaryUpload.uploadToCloudinary(
        req.files.bookCover[0],
        "bookCover"
      );
      updates.bookCover = bookCoverUploadResult.url;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const updatedBook = await Book.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (updates.stock !== undefined) {
      if (updatedBook.stock === 0) {
        console.log(`🚨 Book "${updatedBook.title}" is OUT OF STOCK!`);
      } else if (updatedBook.stock <= (updatedBook.lowStockThreshold || 5)) {
        console.log(
          `⚠️ Book "${updatedBook.title}" is LOW ON STOCK: ${updatedBook.stock}`
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      book: updatedBook,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.isbn) {
      return res.status(409).json({
        success: false,
        message: "Book with this ISBN already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @description Controller to delete a book by ID
 * @route DELETE api/inventory/book/delete-book/:id
 * @access Private (Super Admin, Seller)
 */
exports.deleteBook = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN" && req.user.role !== "SELLER") {
      return res.status(403).json({
        success: false,
        message:
          "Unauthorized! Only Super Admins and Sellers can delete books.",
      });
    }

    const { id } = req.params;

    const book = await Book.findById(id);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found!" });
    }

    if (book.bookCover) {
      await cloudinaryUpload.deleteFromCloudinary(
        book.bookCover,
        "LibrisVault/bookCover"
      );
    }

    await Book.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Book deleted successfully!",
    });
  } catch (error) {
    console.error("❌ Error Deleting Book:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @description Controller to add a new book using ISBN
 * @route POST api/inventory/book/upload-book-by-isbn
 * @access Private (Seller)
 */
exports.uploadBookByISBN = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { isbn, price, stock, genre, language } = req.body;
    console.log("📥 ISBN request body:", req.body);
    console.log("🖼 Files received:", req.files);

    if (!isbn) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "ISBN number is required" });
    }

    const existingBook = await Book.findOne({ isbn }).session(session);
    if (existingBook) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        success: false,
        message: "Book with this ISBN already exists",
      });
    }

    let bookData = {};
    try {
      const response = await axios.get(
        `https://openlibrary.org/isbn/${isbn}.json`
      );
      bookData = response.data;
      console.log("📚 Open Library data:", bookData);
    } catch (e) {
      console.log("❌ Open Library failed, trying Google Books...");
      try {
        const googleResponse = await axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
        );
        if (googleResponse.data.items && googleResponse.data.items.length > 0) {
          const info = googleResponse.data.items[0].volumeInfo;
          bookData.title = info.title;
          bookData.description = info.description;
          bookData.publish_date = info.publishedDate;
          bookData.publishers = info.publisher ? [info.publisher] : [];
          bookData.number_of_pages = info.pageCount;
          if (info.authors && info.authors.length > 0)
            bookData.authors = info.authors;
          if (info.language) bookData.language = info.language.toUpperCase();
        }
      } catch (googleError) {
        console.error("❌ Google Books also failed:", googleError.message);
      }
    }

    const title = bookData.title || "Unknown Title";
    let author = "Unknown Author";
    if (bookData.authors && bookData.authors.length > 0) {
      if (typeof bookData.authors[0] === "object" && bookData.authors[0].key) {
        try {
          const authorResponse = await axios.get(
            `https://openlibrary.org${bookData.authors[0].key}.json`
          );
          author = authorResponse.data.name || "Unknown Author";
        } catch (authorError) {
          console.error("Error fetching author details:", authorError);
          author = "Unknown Author";
        }
      } else {
        author = bookData.authors[0];
      }
    } else if (bookData.by_statement) author = bookData.by_statement;

    let description = "No description available";
    if (bookData.description) {
      if (
        typeof bookData.description === "object" &&
        bookData.description.value
      ) {
        description = bookData.description.value;
      } else if (typeof bookData.description === "string") {
        description = bookData.description;
      }
    }

    const publicationYear = bookData.publish_date || "Unknown";
    const publisher = bookData.publishers
      ? bookData.publishers[0]
      : "Unknown Publisher";
    const pages = bookData.number_of_pages || 0;
    const bookLanguage = bookData.language || language || "ENGLISH";

    if (!req.files || !req.files.bookCover) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "Book cover image is required" });
    }

    const bookCoverFile = req.files.bookCover[0];
    const cloudinaryResult = await cloudinaryUpload.uploadToCloudinary(
      bookCoverFile,
      "bookCover"
    );

    const book = new Book({
      bookCover: cloudinaryResult.url,
      title,
      author,
      price: parseFloat(price) || 0,
      stock: parseInt(stock) || 0,
      isbn,
      language: bookLanguage,
      description,
      genre: genre ? genre.split(",").map((g) => g.trim()) : ["General"],
      publicationYear,
      publisher,
      pages,
      seller: req.user.id,
    });

    await book.save({ session });

    await Seller.updateOne(
      { _id: req.user.id, inventory: null },
      { $set: { inventory: [] } },
      { session }
    );
    await Seller.findByIdAndUpdate(
      req.user.id,
      { $push: { inventory: book._id } },
      { session, new: true }
    );

    await session.commitTransaction();
    session.endSession();

    if (book.stock === 0)
      console.log(`🚨 Book "${book.title}" is OUT OF STOCK!`);
    else if (book.stock <= (book.lowStockThreshold || 5))
      console.log(`⚠️ Book "${book.title}" is LOW ON STOCK: ${book.stock}`);

    return res.status(200).json({
      success: true,
      message: "Book added successfully using ISBN",
      book,
    });
  } catch (error) {
    console.error("🔥 Error uploading book by ISBN:", error.message);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
