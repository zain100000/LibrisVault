const mongoose = require("mongoose");

/**
 * @schema SellerSchema
 * @description Schema representing seller accounts, including authentication details, store associations, inventory, orders, promotions, and account status.
 */
const SellerSchema = new mongoose.Schema(
  {
    profilePicture: {
      type: String,
      default: null,
    },

    userName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["SELLER"],
      default: "SELLER",
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    phoneVerification: {
      otp: {
        type: String,
        default: null,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
      attempts: {
        type: Number,
        default: 0,
      },
    },

    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },

    inventory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
    ],

    orders: [
      {
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
        },
        status: {
          type: String,
          enum: [
            "ORDER_RECEIVED",
            "TO_PAY",
            "TO_SHIP",
            "TO_RECEIVE",
            "COMPLETED",
            "CANCELLED",
            "REFUNDED",
          ],
          default: "ORDER_RECEIVED",
        },
        placedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    promotions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Promotion",
      },
    ],

    deletionRequest: {
      status: {
        type: String,
        enum: ["NONE", "PENDING"],
        default: "NONE",
      },
      reason: {
        type: String,
        default: null,
      },
      requestedAt: {
        type: Date,
        default: null,
      },
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

    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "BANNED"],
      default: "ACTIVE",
    },

    suspension: {
      type: {
        type: String,
        enum: ["SHORT_TERM", "LONG_TERM"],
        default: null,
      },
      reason: {
        type: String,
        default: null,
      },
      startAt: {
        type: Date,
        default: null,
      },
      endAt: {
        type: Date,
        default: null,
      },
    },

    sessionId: {
      type: String,
      default: null,
    },

    passwordResetToken: {
      type: String,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Seller", SellerSchema);
