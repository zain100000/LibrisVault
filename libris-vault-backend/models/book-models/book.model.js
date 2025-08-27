const mongoose = require("mongoose");

/**
 * @description Rating Schema for book
 */
const ratingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * @description Review Schema for book
 */
const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  review: {
    type: String,
    required: true,
    maxlength: 500,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * @description Book Schema
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

    ratings: [ratingSchema],

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalRatings: {
      type: Number,
      default: 0,
    },

    reviews: [reviewSchema],
  },
  { timestamps: true }
);

/**
 * @description Helper function for updating avaerage rating
 */
BookSchema.methods.updateAverageRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
    return;
  }

  const sum = this.ratings.reduce((total, rating) => total + rating.rating, 0);
  this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
  this.totalRatings = this.ratings.length;
};

module.exports = mongoose.model("Inventory", BookSchema);
