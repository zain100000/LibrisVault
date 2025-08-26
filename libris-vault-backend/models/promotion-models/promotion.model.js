const mongoose = require("mongoose");

const PromotionSchema = new mongoose.Schema(
  {
    scope: {
      type: String,
      enum: ["SYSTEM_WIDE", "SELLER_SPECIFIC", "BOOK_SPECIFIC"],
      default: "BOOK_SPECIFIC",
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: function () {
        return (
          this.scope === "SELLER_SPECIFIC" || this.scope === "BOOK_SPECIFIC"
        );
      },
    },

    title: { type: String, required: true },
    description: { type: String },

    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    applicableBooks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
    ],

    status: {
      type: String,
      enum: ["INACTIVE", "ACTIVE", "REJECTED", "EXPIRED"],
      default: "INACTIVE", 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Promotion", PromotionSchema);
