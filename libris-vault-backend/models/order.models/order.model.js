const mongoose = require("mongoose");

/**
 * @schema OrderSchema
 * @description Schema representing customer orders, including purchased items, payment details, shipping information, and order status.
 */
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
