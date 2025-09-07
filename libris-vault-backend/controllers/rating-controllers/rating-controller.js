const Inventory = require("../../models/inventory-models/inventory.model");
const User = require("../../models/user-models/user.model");

/**
 * @description Controller for a user to rate an inventory item (1-5 stars).
 * @route POST /api/rating/add-rate
 * @access Public
 */
exports.rateInventory = async (req, res) => {
  try {
    const { id, rating } = req.body;
    const userId = req.user.id;

    if (!id || !rating) {
      return res.status(400).json({
        success: false,
        message: "Inventory item ID and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5 stars",
      });
    }

    const [inventory, user] = await Promise.all([
      Inventory.findById(id),
      User.findById(userId),
    ]);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingRatingIndex = inventory.ratings.findIndex(
      (r) => r.userId.toString() === userId
    );

    if (existingRatingIndex > -1) {
      inventory.ratings[existingRatingIndex].rating = rating;
      inventory.ratings[existingRatingIndex].createdAt = new Date();
    } else {
      inventory.ratings.push({
        userId,
        rating,
        createdAt: new Date(),
      });
    }

    inventory.updateAverageRating();
    await inventory.save();

    res.status(200).json({
      success: true,
      message:
        existingRatingIndex > -1
          ? "Rating updated successfully"
          : "Inventory item rated successfully",
      rating: {
        id: inventory._id,
        inventoryTitle: inventory.title,
        rating,
        averageRating: inventory.averageRating,
        totalRatings: inventory.totalRatings,
      },
    });
  } catch (err) {
    console.error("Rate inventory item error:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @description Controller to get inventory item ratings and reviews.
 * @route GET /api/rating/get-inventory-rating/:inventoryId
 * @access Public
 */
exports.getInventoryRatings = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const { page = 1, limit = 10, sortBy = "newest" } = req.query;

    const inventory = await Inventory.findById(inventoryId)
      .populate({
        path: "ratings.userId",
        select: "userName profilePicture",
      })
      .select("ratings averageRating totalRatings title");

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    let sortedRatings = [...inventory.ratings];
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
      5: inventory.ratings.filter((r) => r.rating === 5).length,
      4: inventory.ratings.filter((r) => r.rating === 4).length,
      3: inventory.ratings.filter((r) => r.rating === 3).length,
      2: inventory.ratings.filter((r) => r.rating === 2).length,
      1: inventory.ratings.filter((r) => r.rating === 1).length,
    };

    res.status(200).json({
      success: true,
      inventoryTitle: inventory.title,
      averageRating: inventory.averageRating,
      totalRatings: inventory.totalRatings,
      ratingDistribution,
      ratings: paginatedRatings,
      currentPage: parseInt(page),
      totalPages: Math.ceil(inventory.ratings.length / limit),
      hasNext: endIndex < inventory.ratings.length,
      hasPrev: startIndex > 0,
    });
  } catch (err) {
    console.error("Get inventory ratings error:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @description Controller to get a user's rating for a specific inventory item.
 * @route GET /api/rating/user-rating/:inventoryId
 * @access Public
 */
exports.getUserRating = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const userId = req.user.id;

    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    const userRating = inventory.ratings.find(
      (r) => r.userId.toString() === userId
    );

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
    });
  }
};

/**
 * @description Controller to delete a user's rating for a specific inventory item.
 * @route DELETE /api/rating/delete-rating/:inventoryId
 * @access Public
 */
exports.deleteRating = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const userId = req.user.id;

    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    const ratingIndex = inventory.ratings.findIndex(
      (r) => r.userId.toString() === userId
    );
    if (ratingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Rating not found",
      });
    }

    inventory.ratings.splice(ratingIndex, 1);
    inventory.updateAverageRating();
    await inventory.save();

    res.status(200).json({
      success: true,
      message: "Rating deleted successfully",
      averageRating: inventory.averageRating,
      totalRatings: inventory.totalRatings,
    });
  } catch (err) {
    console.error("Delete rating error:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @description Controller to get a list of top-rated inventory items.
 * @route GET /api/rating/top-rated
 * @access Public
 */
exports.getTopRatedInventory = async (req, res) => {
  try {
    const { limit = 10, minRatings = 5 } = req.query;

    const topRatedInventory = await Inventory.find({
      totalRatings: { $gte: parseInt(minRatings) },
      averageRating: { $gt: 0 },
    })
      .sort({ averageRating: -1, totalRatings: -1 })
      .limit(parseInt(limit))
      .select("title author bookCover averageRating totalRatings price");

    res.status(200).json({
      success: true,
      inventory: topRatedInventory,
      count: topRatedInventory.length,
    });
  } catch (err) {
    console.error("Get top rated inventory error:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
