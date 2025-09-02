const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
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

    items: [
      {
        book: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Inventory",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["STRIPE", "CASH_ON_DELIVERY"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    status: {
      type: String,
      enum: [
        "ORDER_RECEIVED", // Order placed, waiting for confirmation
        "PAYMENT_CONFIRMED", // Stripe successful or COD confirmed
        "PREPARING", // Seller preparing the order
        "READY_FOR_PICKUP", // Ready for courier/user pickup
        "PICKED_UP", // Courier picked up the book
        "COMPLETED", // Delivered successfully
        "CANCELLED", // Cancelled before dispatch
        "REFUNDED", // Refunded after payment
      ],
      default: "ORDER_RECEIVED",
    },

    shippingAddress: {
      type: String,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
