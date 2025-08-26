const mongoose = require("mongoose");

/**
 * @description Global schema for Book
 */
const BookSchema = new mongoose.Schema(
  {
    bookCover: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    author: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    isbn: {
      type: String,
      unique: true,
      sparse: true,
    },

    language: {
      type: String,
      enum: ["ENGLISH", "URDU"],
      default: "ENGLISH",
    },

    description: {
      type: String,
    },

    genre: {
      type: [String],
      default: [],
    },

    publicationYear: {
      type: String,
    },

    publisher: {
      type: String,
    },

    pages: {
      type: Number,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },

    discountedPrice: {
      type: Number,
      default: null,
    },

    activePromotion: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", BookSchema);
