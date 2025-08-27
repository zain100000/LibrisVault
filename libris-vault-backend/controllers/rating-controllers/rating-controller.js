const Inventory = require("../../models/book-models/book.model");
const User = require("../../models/user-models/user.model");

/**
 * @description Rate a book (1-5 stars)
 * @route POST /api/rating/add-rate
 * @access Public
 */
exports.rateBook = async (req, res) => {
  try {
    const { id, rating } = req.body;
    const userId = req.user.id;

    if (!id || !rating) {
      return res.status(400).json({
        success: false,
        message: "Book ID and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5 stars",
      });
    }

    const [book, user] = await Promise.all([
      Inventory.findById(id),
      User.findById(userId),
    ]);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingRatingIndex = book.ratings.findIndex(
      (r) => r.userId.toString() === userId
    );

    if (existingRatingIndex > -1) {
      book.ratings[existingRatingIndex].rating = rating;
      book.ratings[existingRatingIndex].createdAt = new Date();
    } else {
      book.ratings.push({
        userId,
        rating,
        createdAt: new Date(),
      });
    }

    book.updateAverageRating();
    await book.save();

    res.status(200).json({
      success: true,
      message:
        existingRatingIndex > -1
          ? "Rating updated successfully"
          : "Book rated successfully",
      rating: {
        id: book._id,
        bookTitle: book.title,
        rating,
        averageRating: book.averageRating,
        totalRatings: book.totalRatings,
      },
    });
  } catch (err) {
    console.error("Rate book error:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

/**
 * @description Get book ratings and reviews
 * @route GET /api/rating/get-book-rating/:id
 * @access Public
 */
exports.getBookRatings = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, sortBy = "newest" } = req.query;

    const book = await Inventory.findById(id)
      .populate({
        path: "ratings.userId",
        select: "userName profilePicture",
      })
      .select("ratings averageRating totalRatings title");

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    let sortedRatings = [...book.ratings];
    switch (sortBy) {
      case "newest":
        sortedRatings.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case "oldest":
        sortedRatings.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case "highest":
        sortedRatings.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        sortedRatings.sort((a, b) => a.rating - b.rating);
        break;
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedRatings = sortedRatings.slice(startIndex, endIndex);

    const ratingDistribution = {
      5: book.ratings.filter((r) => r.rating === 5).length,
      4: book.ratings.filter((r) => r.rating === 4).length,
      3: book.ratings.filter((r) => r.rating === 3).length,
      2: book.ratings.filter((r) => r.rating === 2).length,
      1: book.ratings.filter((r) => r.rating === 1).length,
    };

    res.status(200).json({
      success: true,
      bookTitle: book.title,
      averageRating: book.averageRating,
      totalRatings: book.totalRatings,
      ratingDistribution,
      ratings: paginatedRatings,
      currentPage: parseInt(page),
      totalPages: Math.ceil(book.ratings.length / limit),
      hasNext: endIndex < book.ratings.length,
      hasPrev: startIndex > 0,
    });
  } catch (err) {
    console.error("Get book ratings error:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

/**
 * @description Get user's rating for a book
 * @route GET /api/rating/user-rating/:id
 * @access Public
 */
exports.getUserRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const book = await Inventory.findById(id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const userRating = book.ratings.find((r) => r.userId.toString() === userId);

    res.status(200).json({
      success: true,
      rating: userRating || null,
      hasRated: !!userRating,
    });
  } catch (err) {
    console.error("Get user rating error:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

/**
 * @description Delete user's rating
 * @route DELETE /api/rating/delete-rating/:id
 * @access Public
 */
exports.deleteRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const book = await Inventory.findById(id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const ratingIndex = book.ratings.findIndex(
      (r) => r.userId.toString() === userId
    );
    if (ratingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Rating not found",
      });
    }

    book.ratings.splice(ratingIndex, 1);
    book.updateAverageRating();
    await book.save();

    res.status(200).json({
      success: true,
      message: "Rating deleted successfully",
      averageRating: book.averageRating,
      totalRatings: book.totalRatings,
    });
  } catch (err) {
    console.error("Delete rating error:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

/**
 * @description Get top rated books
 * @route GET /api/rating/top-rated
 * @access Public
 */
exports.getTopRatedBooks = async (req, res) => {
  try {
    const { limit = 10, minRatings = 5 } = req.query;

    const topRatedBooks = await Inventory.find({
      totalRatings: { $gte: parseInt(minRatings) },
      averageRating: { $gt: 0 },
    })
      .sort({ averageRating: -1, totalRatings: -1 })
      .limit(parseInt(limit))
      .select("title author bookCover averageRating totalRatings price");

    res.status(200).json({
      success: true,
      books: topRatedBooks,
      count: topRatedBooks.length,
    });
  } catch (err) {
    console.error("Get top rated books error:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};
