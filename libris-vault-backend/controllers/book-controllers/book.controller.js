const mongoose = require("mongoose");
const axios = require("axios");
const Book = require("../../models/book-models/book.model");
const Seller = require("../../models/seller.models/seller-model");
const cloudinaryUpload = require("../../utilities/cloudinary/cloudinary.utility");
const {
  getActiveSystemWidePromotion,
  getActiveSellerPromotion,
} = require("../../utilities/promotion/promotion.utility");

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

    res.status(201).json({
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
    let books = await Book.find().populate("seller");

    const activeSystemPromo = await getActiveSystemWidePromotion();
    const activeSellerPromos = await getActiveSellerPromotion();

    if (activeSystemPromo) {
      const discount = activeSystemPromo.discountPercentage;

      books = await Promise.all(
        books.map(async (book) => {
          const discountedPrice = (
            book.price -
            (book.price * discount) / 100
          ).toFixed(2);

          book.discountedPrice = parseFloat(discountedPrice);
          book.activePromotion = activeSystemPromo.title;
          await book.save();

          return book;
        })
      );
    } else if (activeSellerPromos && activeSellerPromos.length > 0) {
      // Apply seller-specific promotions
      books = await Promise.all(
        books.map(async (book) => {
          const promo = activeSellerPromos.find(
            (p) =>
              String(p.sellerId) === String(book.seller._id) &&
              p.applicableBooks.includes(book._id)
          );

          if (promo) {
            const discountedPrice = (
              book.price -
              (book.price * promo.discountPercentage) / 100
            ).toFixed(2);

            book.discountedPrice = parseFloat(discountedPrice);
            book.activePromotion = promo.title;
          } else {
            book.discountedPrice = null;
            book.activePromotion = null;
          }

          await book.save();
          return book;
        })
      );
    } else {
      // No active promotions at all → reset
      books = await Promise.all(
        books.map(async (book) => {
          book.discountedPrice = null;
          book.activePromotion = null;
          await book.save();
          return book;
        })
      );
    }

    res.json({
      success: true,
      message: "Books fetched successfully",
      books,
    });
  } catch (error) {
    console.error("❌ Error fetching books with promo:", error);
    res.status(500).json({ success: false, message: "Server error" });
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

    res.status(201).json({
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

    res.status(201).json({
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
    let sourceUsed = "none";

    const openLibrary = axios
      .get(`https://openlibrary.org/isbn/${isbn}.json`)
      .catch(() => null);
    const googleBooks = axios
      .get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
      .catch(() => null);
    const olSearch = axios
      .get(`https://openlibrary.org/search.json?q=isbn:${isbn}`)
      .catch(() => null);

    const [olRes, googleRes, olSearchRes] = await Promise.all([
      openLibrary,
      googleBooks,
      olSearch,
    ]);

    if (olRes && olRes.data && olRes.data.title) {
      bookData = olRes.data;
      sourceUsed = "Open Library";
    }
    if (
      (!bookData.title || !bookData.authors) &&
      googleRes &&
      googleRes.data.items &&
      googleRes.data.items.length > 0
    ) {
      const info = googleRes.data.items[0].volumeInfo;
      bookData = {
        ...bookData,
        title: bookData.title || info.title,
        description: bookData.description || info.description,
        publish_date: bookData.publish_date || info.publishedDate,
        publishers:
          bookData.publishers || (info.publisher ? [info.publisher] : []),
        number_of_pages: bookData.number_of_pages || info.pageCount,
        authors: bookData.authors || info.authors,
        language: bookData.language || info.language,
        categories: bookData.categories || info.categories,
      };
      sourceUsed =
        sourceUsed === "none" ? "Google Books" : sourceUsed + "+Google";
    }
    if (
      (!bookData.title || !bookData.authors) &&
      olSearch &&
      olSearch.data.docs &&
      olSearch.data.docs.length > 0
    ) {
      const doc = olSearch.data.docs[0];
      bookData = {
        ...bookData,
        title: bookData.title || doc.title,
        publish_date:
          bookData.publish_date ||
          (doc.first_publish_year ? doc.first_publish_year.toString() : ""),
        publishers:
          bookData.publishers || (doc.publisher ? [doc.publisher[0]] : []),
        number_of_pages: bookData.number_of_pages || doc.number_of_pages,
        authors: bookData.authors || doc.author_name,
        language: bookData.language || doc.language,
        subjects: bookData.subjects || doc.subject,
      };
      sourceUsed =
        sourceUsed === "none"
          ? "Open Library Search"
          : sourceUsed + "+OpenSearch";
    }

    const title = bookData.title || "Unknown Title";

    let author = "Unknown Author";
    if (bookData.authors && bookData.authors.length > 0) {
      const firstAuthor = bookData.authors[0];
      if (typeof firstAuthor === "object") {
        if (firstAuthor.name) {
          author = firstAuthor.name;
        } else if (firstAuthor.key) {
          try {
            const authorResponse = await axios.get(
              `https://openlibrary.org${firstAuthor.key}.json`
            );
            author = authorResponse.data.name || "Unknown Author";
          } catch {
            author = "Unknown Author";
          }
        }
      } else if (typeof firstAuthor === "string") {
        author = cleanAuthorName(firstAuthor);
      }
    } else if (bookData.by_statement) {
      author = cleanAuthorName(bookData.by_statement);
    } else if (bookData.author_name && bookData.author_name.length > 0) {
      author = cleanAuthorName(bookData.author_name[0]);
    } else if (bookData.contributors && bookData.contributors.length > 0) {
      const firstContributor = bookData.contributors[0];
      author = cleanAuthorName(
        typeof firstContributor === "object"
          ? firstContributor.name
          : firstContributor
      );
    } else if (bookData.creator) {
      if (Array.isArray(bookData.creator)) {
        author = cleanAuthorName(
          typeof bookData.creator[0] === "object"
            ? bookData.creator[0].name
            : bookData.creator[0]
        );
      } else if (typeof bookData.creator === "object") {
        author = cleanAuthorName(bookData.creator.name || "Unknown Author");
      } else {
        author = cleanAuthorName(bookData.creator);
      }
    }
    if (typeof author !== "string") {
      try {
        author = JSON.stringify(author);
      } catch {
        author = "Unknown Author";
      }
    }
    if (author === "Unknown Author" && title !== "Unknown Title") {
      const byIndex = title.toLowerCase().lastIndexOf(" by ");
      if (byIndex !== -1) {
        author = cleanAuthorName(title.substring(byIndex + 4).trim());
      } else {
        author = "Various Authors";
      }
    }

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

    const publicationYear =
      bookData.publish_date ||
      bookData.publishedDate ||
      bookData.first_publish_year ||
      "Unknown";
    const publisher =
      (bookData.publishers && bookData.publishers[0]) ||
      bookData.publisher ||
      "Unknown Publisher";
    const pages = bookData.number_of_pages || bookData.pages || 0;
    const bookLanguage =
      bookData.language ||
      language ||
      (bookData.language && bookData.language[0]) ||
      "ENGLISH";

    let genres = ["General"];
    if (genre) {
      genres = genre.split(",").map((g) => g.trim());
    } else if (bookData.genres && bookData.genres.length > 0) {
      genres = bookData.genres;
    } else if (bookData.categories && bookData.categories.length > 0) {
      genres = bookData.categories;
    } else if (bookData.subjects && bookData.subjects.length > 0) {
      genres = bookData.subjects.slice(0, 3);
    }

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

    const languageMap = {
      en: "ENGLISH",
    };

    function normalizeLanguage(lang) {
      if (!lang) return "ENGLISH";
      const lower = lang.toString().toLowerCase();
      return languageMap[lower] || "ENGLISH";
    }

    const book = new Book({
      bookCover: cloudinaryResult.url,
      title,
      author: author.substring(0, 255),
      price: parseFloat(price) || 0,
      stock: parseInt(stock) || 0,
      isbn,
      language: normalizeLanguage(bookLanguage),
      description,
      genre: genres,
      publicationYear: publicationYear.toString(),
      publisher,
      pages,
      seller: req.user.id,
      dataSource: sourceUsed,
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

    return res.status(201).json({
      success: true,
      message: "Book added successfully using ISBN",
      book,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * @description Cleans and formats author names by removing dates and reformatting "Last, First" to "First Last".
 * @param {string} author - The raw author name string.
 */
function cleanAuthorName(author) {
  if (typeof author !== "string") return author;
  author = author.replace(/,\s*\d{4}[-–]\d{4}\.?/g, "");
  author = author.replace(/,\s*\d{4}[-–]?\s*(?:present|current)?\.?/g, "");
  author = author.replace(/,\s*b\.\s*\d{4}\.?/g, "");
  author = author.replace(/[,.\s]+$/, "");
  author = author.replace(/\s+/g, " ").trim();
  const commaIndex = author.indexOf(",");
  if (commaIndex > -1) {
    const lastName = author.substring(0, commaIndex).trim();
    const firstName = author.substring(commaIndex + 1).trim();
    if (firstName && lastName) {
      author = `${firstName} ${lastName}`;
    }
  }
  return author;
}
