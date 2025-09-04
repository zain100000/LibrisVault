const mongoose = require("mongoose");

/**
 * @schema BookRequestSchema
 * @description Schema representing a user's request for a book from a store.
 */
const BookRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    requestedTitle: {
      type: String,
      required: true,
      trim: true,
    },

    requestedAuthor: {
      type: String,
      trim: true,
    },

    message: {
      type: String,
      maxlength: 500,
      default: null,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BookRequest", BookRequestSchema);
