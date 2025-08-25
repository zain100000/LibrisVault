const mongoose = require("mongoose");

/**
 * @description Store schema for Seller
 */
const StoreSchema = new mongoose.Schema(
  {
    storeLogo: {
      type: String,
    },

    storeName: {
      type: String,
    },

    storeType: {
      type: String,
      enum: ["PHYSICAL"],
      default: "PHYSICAL",
    },

    address: {
      type: String,
    },

    country: {
      type: String,
      default: "PAKISTAN",
    },

    storeDescription: {
      type: String,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationDate: {
      type: Date,
    },

    documents: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "SUSPENDED"],
      default: "PENDING",
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    sessionId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Store", StoreSchema);
