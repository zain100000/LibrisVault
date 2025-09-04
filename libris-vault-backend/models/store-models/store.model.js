const mongoose = require("mongoose");

/**
 * @schema StoreSchema
 * @description Schema representing a seller’s store, including profile details, verification status, associated documents, login security, and linked book requests.
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

    bookRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BookRequest",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Store", StoreSchema);
