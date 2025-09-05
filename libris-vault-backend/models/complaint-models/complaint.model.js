const mongoose = require("mongoose");

/**
 * @schema ComplaintSchema
 * @description Schema representing a complaint raised by a user or seller,
 * including the reason, status, and resolution history managed by superadmin.
 */

const complaintSchema = new mongoose.Schema(
  {
    raisedBy: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },

      role: {
        type: String,
        enum: ["USER", "SELLER"],
        required: true,
      },
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["OPENED", "IN_REVIEW", "RESOLVED", "CLOSED"],
      default: "OPENED",
    },

    resolutionNotes: [
      {
        action: String,
        takenBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "SuperAdmin",
        },

        note: String,

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
