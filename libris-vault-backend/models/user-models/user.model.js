const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    profilePicture: {
      type: String,
    },

    userName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
    },

    cart: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Inventory",
          required: true,
        },

        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },

        price: {
          type: Number,
          required: true,
        },

        unitPrice: {
          type: Number,
          required: true,
        },

        addedAt: {
          type: Date,
          default: Date.now,
        },
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
            "ORDER_RECEIVED", // Order placed, waiting for confirmation
            "TO_PAY", // Waiting for payment
            "TO_SHIP", // Payment done, waiting for seller to ship
            "TO_RECEIVE", // Shipped, waiting for customer to receive
            "COMPLETED", // Delivered successfully
            "CANCELLED", // Cancelled before dispatch
            "REFUNDED", // Refunded after payment
          ],
          default: "ORDER_RECEIVED",
        },

        placedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    role: {
      type: String,
      enum: ["USER"],
      default: "USER",
    },

    createdAt: {
      type: Date,
      default: Date.now,
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

module.exports = mongoose.model("User", userSchema);
