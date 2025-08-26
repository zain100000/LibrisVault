const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SuperAdmin = require("../../models/super-admin-models/super-admin.model");
const Seller = require("../../models/seller.models/seller-model");
const Store = require("../../models/store-models/store.model");
const Book = require("../../models/book-models/book.model");
const Promotion = require("../../models/promotion-models/promotion.model");
const Order = require("../../models/order.models/order.model");
const profilePictureUpload = require("../../utilities/cloudinary/cloudinary.utility");
const {
  passwordRegex,
  hashPassword,
} = require("../../helpers/password-helper/password.helper");
const {
  generateSecureToken,
} = require("../../helpers/token-helper/token.helper");

// ------------------------------ SUPER ADMIN BASE FUNCTIONS  ----------------------------------
// ------------------------------ SUPER ADMIN BASE FUNCTIONS  ----------------------------------
// ------------------------------ SUPER ADMIN BASE FUNCTIONS  ----------------------------------
// ------------------------------ SUPER ADMIN BASE FUNCTIONS  ----------------------------------

/**
 * @description SuperAdmin registration
 * @route POST /api/super-admin/signup-superadmin
 * @access Public
 */
exports.registerSuperAdmin = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
    }

    const existingSuperAdmin = await SuperAdmin.findOne({
      email: email.toLowerCase(),
      role: "SUPERADMIN",
    });

    if (existingSuperAdmin) {
      return res.status(409).json({
        success: false,
        message: "SuperAdmin with this email already exists",
      });
    }

    let userProfileImageUrl = null;
    let uploadedFileUrl = null;
    if (req.files?.profilePicture) {
      const uploadResult = await profilePictureUpload.uploadToCloudinary(
        req.files.profilePicture[0],
        "profilePicture"
      );
      userProfileImageUrl = uploadResult.url;
      uploadedFileUrl = uploadResult.url;
    }

    const hashedPassword = await hashPassword(password);

    const superAdmin = new SuperAdmin({
      profilePicture: userProfileImageUrl,
      userName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "SUPERADMIN",
      isSuperAdmin: true,
      isActive: true,
      createdAt: new Date(),
      lastLogin: null,
      loginAttempts: 0,
      lockUntil: null,
    });

    await superAdmin.save();

    res.status(201).json({
      success: true,
      message: "SuperAdmin created successfully",
    });
  } catch (error) {
    console.error("❌ Error creating super admin:", error);

    if (uploadedFileUrl) {
      try {
        await profilePictureUpload.deleteFromCloudinary(uploadedFileUrl);
        console.log("🧹 Rolled back Cloudinary upload");
      } catch (cloudErr) {
        console.error("❌ Failed to rollback Cloudinary upload:", cloudErr);
      }
    }

    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({
        success: false,
        message: "SuperAdmin with this email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @description SuperAdmin login
 * @route POST /api/super-admin/signin-superadmin
 * @access Public
 */
exports.loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("📥 Login request received:", {
      email,
      passwordProvided: !!password,
    });

    if (!email || !password) {
      console.log("❌ Missing email or password");
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    let superadmin = await SuperAdmin.findOne({ email });
    console.log(
      "🔎 Found superadmin in DB:",
      superadmin ? superadmin.email : "Not Found"
    );

    if (!superadmin) {
      console.log("❌ Invalid email");
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (superadmin.lockUntil && superadmin.lockUntil > Date.now()) {
      const remaining = Math.ceil((superadmin.lockUntil - Date.now()) / 60000);
      console.log(`🔒 Account locked. Remaining minutes: ${remaining}`);
      return res.status(423).json({
        success: false,
        message: `Account locked. Try again in ${remaining} minutes.`,
      });
    }

    if (superadmin.lockUntil && superadmin.lockUntil <= Date.now()) {
      console.log("⏳ Lock expired. Resetting attempts.");
      await SuperAdmin.updateOne(
        { _id: superadmin._id },
        { $set: { loginAttempts: 0, lockUntil: null } }
      );
      superadmin.loginAttempts = 0;
      superadmin.lockUntil = null;
    }

    const isMatch = await bcrypt.compare(password, superadmin.password);
    console.log("🔑 Password match status:", isMatch);

    if (!isMatch) {
      const updated = await SuperAdmin.findOneAndUpdate(
        { _id: superadmin._id },
        { $inc: { loginAttempts: 1 } },
        { new: true }
      );

      console.log("⚠️ Wrong password. Attempts:", updated.loginAttempts);

      if (updated.loginAttempts >= 3) {
        const lockTime = Date.now() + 30 * 60 * 1000;
        await SuperAdmin.updateOne(
          { _id: superadmin._id },
          { $set: { lockUntil: lockTime } }
        );
        console.log("🚨 Account locked until:", new Date(lockTime));
        return res.status(423).json({
          success: false,
          message:
            "Too many failed login attempts. Account locked for 30 minutes.",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        attempts: updated.loginAttempts,
      });
    }

    const sessionId = generateSecureToken();
    const updatedUser = await SuperAdmin.findOneAndUpdate(
      { _id: superadmin._id },
      {
        $set: {
          loginAttempts: 0,
          lockUntil: null,
          lastLogin: new Date(),
          sessionId,
        },
      },
      { new: true }
    );

    console.log("✅ Successful login saved:", {
      loginAttempts: updatedUser.loginAttempts,
      lockUntil: updatedUser.lockUntil,
      lastLogin: updatedUser.lastLogin,
      sessionId: updatedUser.sessionId,
    });

    const payload = {
      role: "SUPERADMIN",
      user: { id: updatedUser.id, email: updatedUser.email },
      sessionId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { algorithm: "HS256" },
      (err, token) => {
        if (err) {
          console.error("❌ JWT Sign Error:", err);
          return res
            .status(500)
            .json({ success: false, message: "Error generating token" });
        }

        console.log("🎟️ Token generated successfully");

        res.cookie("accessToken", token, {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 60 * 60 * 1000,
        });

        res.json({
          success: true,
          message: "Super Admin login successful",
          superAdmin: {
            id: updatedUser.id,
            userName: updatedUser.userName,
            email: updatedUser.email,
          },
          token,
          expiresIn: 3600,
        });
      }
    );
  } catch (err) {
    console.error("🔥 Login Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error logging in" });
  }
};

/**
 * @description Get SuperAdmin by ID
 * @route GET /api/super-admin/get-superadmin-by-id/:id
 * @access Private (SuperAdmin)
 */
exports.getSuperAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    const superAdmin = await SuperAdmin.findById(id).select(
      "-password -__v -refreshToken"
    );
    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "Super Admin not found",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Super Admin fetched successfully",
      superAdmin: superAdmin,
    });
  } catch (err) {
    console.error("❌ getSuperAdminById Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @description Reset SuperAdmin password
 * @route PATCH /api/super-admin/reset-superadmin-password
 * @access Private (SuperAdmin)
 */
exports.resetSuperAdminPassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
    }

    let superAdmin = await SuperAdmin.findOne({ email });
    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message:
          "If an account with that email exists, a password reset email has been sent",
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      superAdmin.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const isSameAsCurrent = await bcrypt.compare(
      newPassword,
      superAdmin.password
    );
    if (isSameAsCurrent) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as the current password",
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    superAdmin.password = hashedPassword;
    superAdmin.passwordChangedAt = new Date();
    superAdmin.sessionId = generateSecureToken();
    await superAdmin.save();

    res.status(201).json({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error Resetting Password!",
    });
  }
};

/**
 * @description SuperAdmin logout
 * @route POST /api/super-admin/logout-superadmin
 * @access Private (SuperAdmin)
 */
exports.logoutSuperAdmin = async (req, res, next) => {
  try {
    if (req.user && req.user.id) {
      await SuperAdmin.findByIdAndUpdate(req.user.id, {
        $set: { sessionId: generateSecureToken() },
      });
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "strict",
    });

    res.status(201).json({
      success: true,
      message: "Logout Successfully!",
    });
  } catch (err) {
    console.error("Error Logging Out:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ------------------------------ SUPER ADMIN ACTIONS FUNCTIONS  ----------------------------------
// ------------------------------ SUPER ADMIN ACTIONS FUNCTIONS  ----------------------------------
// ------------------------------ SUPER ADMIN ACTIONS FUNCTIONS  ----------------------------------
// ------------------------------ SUPER ADMIN ACTIONS FUNCTIONS  ----------------------------------

/**
 * @description Approve and process seller account deletion
 * @route DELETE /api/super-admin/approve-seller-account-deletion/:id
 * @access Private (SuperAdmin)
 */
exports.approveSellerAccountDeletion = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;

    const seller = await Seller.findById(id)
      .populate("store")
      .populate("inventory")
      .populate("promotion")
      .populate("order")
      .session(session);

    if (!seller) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    if (seller.deletionRequest.status !== "PENDING") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "No pending deletion request for this seller",
      });
    }

    if (seller.profilePicture) {
      try {
        await deleteFromCloudinary(seller.profilePicture);
      } catch (err) {
        console.error("Error deleting seller profile picture:", err);
      }
    }

    if (seller.store) {
      await Store.findByIdAndDelete(seller.store._id).session(session);
    }

    if (seller.inventory && seller.inventory.length > 0) {
      await Book.deleteMany({ _id: { $in: seller.inventory } }).session(
        session
      );
    }

    if (seller.promotion && seller.promotion.length > 0) {
      await Promotion.deleteMany({ _id: { $in: seller.promotion } }).session(
        session
      );
    }

    await Order.deleteMany({ seller: seller._id }).session(session);

    await Seller.findByIdAndDelete(seller._id).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Seller account and all associated data deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting seller account:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @description Suspend or ban a seller account
 * @route PUT /api/super-admin/update-seller-status/:id
 * @access Private (SuperAdmin)
 */
exports.updateSellerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, durationInHours, reason } = req.body;

    if (!["SUSPEND", "BAN"].includes(action)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid action" });
    }

    const seller = await Seller.findById(id);
    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    const now = new Date();

    if (action === "SUSPEND") {
      seller.status = "SUSPENDED";
      seller.suspension = {
        type: "SHORT_TERM",
        reason: reason || null,
        startAt: now,
        endAt: new Date(
          now.getTime() + (durationInHours || 24) * 60 * 60 * 1000
        ),
      };
    } else if (action === "BAN") {
      seller.status = "BANNED";
      seller.suspension = {
        type: "LONG_TERM",
        reason: reason || null,
        startAt: now,
        endAt: null,
      };
    }

    await seller.save();

    res.status(201).json({
      success: true,
      message: `Seller ${action.toLowerCase()}ed successfully`,
    });
  } catch (error) {
    console.error("Error updating seller status:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @description Middleware to prevent login if seller is suspended or banned
 * @route N/A
 * @access Public
 */
exports.preventLoginIfSuspendedOrBanned = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  const seller = await Seller.findOne({ email: email.toLowerCase() });
  if (!seller) return next();

  if (seller.status === "BANNED") {
    return res
      .status(403)
      .json({ success: false, message: "Your account is banned." });
  }

  if (seller.status === "SUSPENDED") {
    const now = new Date();
    if (seller.suspension?.endAt && now < seller.suspension.endAt) {
      return res
        .status(403)
        .json({ success: false, message: "Your account is suspended." });
    } else {
      // Auto-reactivate after suspension ends
      seller.status = "ACTIVE";
      seller.suspension = null;
      await seller.save();
    }
  }

  next();
};

/**
 * @description Middleware to prevent signup if seller is suspended or banned
 * @route N/A
 * @access Public
 */
exports.preventSignupIfBanned = async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next();

  const seller = await Seller.findOne({ email: email.toLowerCase() });
  if (!seller) return next();

  if (seller.status === "BANNED" || seller.status === "SUSPENDED") {
    return res.status(403).json({
      success: false,
      message:
        "Cannot register with this email. Account is suspended or banned.",
    });
  }

  next();
};

/**
 * @description Get a list of all sellers with basic details
 * @route GET /api/super-admin/get-all-sellers
 * @access Private (SuperAdmin)
 */
exports.getAllSellers = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "SUPERADMIN") {
      return res
        .status(403)
        .json({ success: false, message: "Only super admin can have access" });
    }

    const sellers = await Seller.find().populate({
      path: "store",
    });
    res.status(201).json({
      success: true,
      message: "Sellers fetched successfully!",
      sellers,
    });
  } catch (error) {
    console.error("Error fetching sellers:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @description Update the status of a seller's store (approve, suspend, etc.)
 * @route PATCH /api/super-admin/update-store-status/:id
 * @access Private (SuperAdmin)
 */
exports.updateStoreStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log("📥 Incoming request to update store status");
    console.log("➡️ Store ID:", id);
    console.log("➡️ New Status:", status);

    if (!["PENDING", "ACTIVE", "SUSPENDED"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const store = await Store.findById(id);
    if (!store) {
      console.log("❌ Store not found");
      return res
        .status(404)
        .json({ success: false, message: "Store not found" });
    }

    store.status = status;
    if (status === "ACTIVE") {
      store.isVerified = true;
      store.verificationDate = new Date();
    }
    if (status === "SUSPENDED") {
      store.isVerified = false;
    }

    await store.save();

    console.log(
      "✅ Store status updated successfully:",
      store._id,
      "➡️",
      status
    );

    res.status(201).json({
      success: true,
      message: `Store status updated to ${status}`,
      store,
    });
  } catch (error) {
    console.error("❌ Error updating store status:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


