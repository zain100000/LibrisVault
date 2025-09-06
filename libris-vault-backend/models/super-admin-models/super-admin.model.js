const mongoose = require("mongoose");

/**
 * @schema SuperAdminSchema
 * @description Schema representing super admin accounts, including authentication details, account status, security controls, and session management.
 */
const superAdminSchema = new mongoose.Schema(
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
      enum: ["SUPERADMIN"],
      default: "SUPERADMIN",
    },

    isSuperAdmin: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
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
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SuperAdmin", superAdminSchema);
