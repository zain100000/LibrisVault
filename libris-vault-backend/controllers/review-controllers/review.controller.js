const Inventory = require("../../models/inventory-models/inventory.model");
const User = require("../../models/user-models/user.model");

/**
 * @description Controller for adding reviews on an inventory item
 * @route POST /api/review/add-review
 * @access Public
 */
exports.addReview = async (req, res) => {
  try {
    const { id, review } = req.body;
    const userId = req.user.id;

    if (!id || !review) {
      return res.status(400).json({
        success: false,
        message: "Inventory item ID and review are required",
      });
    }

    if (review.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Review cannot exceed 500 characters",
      });
    }

    const [inventory, user] = await Promise.all([
      Inventory.findById(id),
      User.findById(userId),
    ]);

    if (!inventory)
      return res
        .status(404)
        .json({ success: false, message: "Inventory item not found" });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const existing = inventory.reviews.find(
      (r) => r.userId.toString() === userId
    );

    if (existing) {
      existing.review = review;
      existing.createdAt = new Date();
    } else {
      inventory.reviews.push({ userId, review, createdAt: new Date() });
    }

    await inventory.save();

    res.status(200).json({
      success: true,
      message: existing
        ? "Review updated successfully"
        : "Review added successfully",
      review: { userId, id: inventory._id, review },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * @description Controller for getting reviews of an inventory item
 * @route GET /api/review/get-inventory-review/:inventoryId
 * @access Public
 */
exports.getReviews = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const inventory = await Inventory.findById(inventoryId).populate(
      "reviews.userId",
      "userName profilePicture"
    );

    if (!inventory)
      return res
        .status(404)
        .json({ success: false, message: "Inventory item not found" });

    res.status(200).json({
      success: true,
      inventoryTitle: inventory.title,
      reviews: inventory.reviews,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * @description Controller for updating review of an inventory item
 * @route PATCH /api/review/update-review/:inventoryId
 * @access Public
 */
exports.updateReview = async (req, res) => {
  try {
    const { inventoryId } = req.params;
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

    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
      return res
        .status(404)
        .json({ success: false, message: "Inventory item not found" });
    }

    const idx = inventory.reviews.findIndex(
      (r) => r.userId.toString() === userId
    );
    if (idx === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    inventory.reviews[idx].review = review;
    inventory.reviews[idx].createdAt = new Date();
    await inventory.save();

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review: inventory.reviews[idx],
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * @description Controller for deleting reviews on an inventory item
 * @route DELETE /api/review/delete-review/:inventoryId
 * @access Public
 */
exports.deleteReview = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const userId = req.user.id;

    const inventory = await Inventory.findById(inventoryId);
    if (!inventory)
      return res
        .status(404)
        .json({ success: false, message: "Inventory item not found" });

    const reviewIndex = inventory.reviews.findIndex(
      (r) => r.userId.toString() === userId
    );
    if (reviewIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    inventory.reviews.splice(reviewIndex, 1);
    await inventory.save();

    res
      .status(200)
      .json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};
