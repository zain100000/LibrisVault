const Inventory = require("../../models/book-models/book.model");
const User = require("../../models/user-models/user.model");

/**
 * @description Controller for adding reviews on the book
 * @route POST /api/review/add-review
 * @access Public
 */
exports.addReview = async (req, res) => {
  try {
    const { id, review } = req.body;
    const userId = req.user.id;

    if (!id || !review) {
      return res
        .status(400)
        .json({ success: false, message: "Book ID and review are required" });
    }

    if (review.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Review cannot exceed 500 characters",
      });
    }

    const [book, user] = await Promise.all([
      Inventory.findById(id),
      User.findById(userId),
    ]);

    if (!book)
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const existing = book.reviews.find((r) => r.userId.toString() === userId);

    if (existing) {
      existing.review = review;
      existing.createdAt = new Date();
    } else {
      book.reviews.push({ userId, review, createdAt: new Date() });
    }

    await book.save();

    res.status(200).json({
      success: true,
      message: existing
        ? "Review updated successfully"
        : "Review added successfully",
      review: { userId, id: book._id, review },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * @description Controller for getting reviews of the book
 * @route GET /api/review/get-book-review
 * @access Public
 */
exports.getReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Inventory.findById(id).populate(
      "reviews.userId",
      "userName profilePicture"
    );

    if (!book)
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });

    res
      .status(200)
      .json({ success: true, bookTitle: book.title, reviews: book.reviews });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * @description Controller for updating review of the book
 * @route PATCH /api/review/update-review/:id
 * @access Public
 */
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { review } = req.body;
    const userId = req.user.id;

    if (!review) {
      return res
        .status(400)
        .json({ success: false, message: "Review is required" });
    }
    if (review.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Review cannot exceed 500 characters",
      });
    }

    const book = await Inventory.findById(id);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    const idx = book.reviews.findIndex((r) => r.userId.toString() === userId);
    if (idx === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    book.reviews[idx].review = review;
    book.reviews[idx].createdAt = new Date();
    await book.save();

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review: book.reviews[idx],
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * @description Controller for deleting reviews on the book
 * @route DELETE /api/review/delete-review/:id
 * @access Public
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const book = await Inventory.findById(id);
    if (!book)
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });

    const reviewIndex = book.reviews.findIndex(
      (r) => r.userId.toString() === userId
    );
    if (reviewIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    book.reviews.splice(reviewIndex, 1);
    await book.save();

    res
      .status(200)
      .json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};
