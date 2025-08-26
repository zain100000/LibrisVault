const mongoose = require("mongoose");
const Seller = require("../../models/seller.models/seller-model");
const profilePictureUpload = require("../../utilities/cloudinary/cloudinary.utility");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const {
  passwordRegex,
  hashPassword,
} = require("../../helpers/password-helper/password.helper");
const {
  generateSecureToken,
} = require("../../helpers/token-helper/token.helper");
const {
  uploadToCloudinary,
} = require("../../utilities/cloudinary/cloudinary.utility");
const {
  sendPasswordResetEmail,
} = require("../../helpers/email-helper/email.helper");

//------------------------------ SELLER BASE FUNCTIONS  ----------------------------------
//----------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------

/**
 * @description Seller registration
 * @route POST /api/seller/signup-seller
 * @access Public
 */
exports.registerSeller = async (req, res) => {
  let uploadedFileUrl = null;

  try {
    const {
      userName,
      email,
      password,
      phone,
      store,
      inventory,
      order,
      promotion,
    } = req.body;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
    }

    const existingSeller = await Seller.findOne({
      email: email.toLowerCase(),
      role: "SELLER",
    });

    if (existingSeller) {
      return res.status(409).json({
        success: false,
        message: "Seller with this email already exists",
      });
    }

    const existingPhone = await Seller.findOne({ phone });
    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "Seller with this phone already exists",
      });
    }

    let profilePictureUrl = null;
    if (req.files?.profilePicture) {
      const uploadResult = await profilePictureUpload.uploadToCloudinary(
        req.files.profilePicture[0],
        "profilePicture"
      );
      profilePictureUrl = uploadResult.url;
      uploadedFileUrl = uploadResult.url;
    }

    const hashedPassword = await hashPassword(password);

    const seller = new Seller({
      profilePicture: profilePictureUrl,
      userName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "SELLER",
      phone,
      isPhoneVerified: false,

      phoneVerification: {
        otp: null,
        expiresAt: null,
        attempts: 0,
      },

      store,
      inventory,
      order,
      promotion,

      deletionRequest: {
        status: "NONE",
        reason: null,
        requestedAt: null,
      },

      createdAt: new Date(),
    });

    await seller.save();

    res.status(201).json({
      success: true,
      message:
        "Seller account created successfully. You can verify your phone now or skip for later.",
      phoneVerificationRequired: true,
    });
  } catch (error) {
    console.error("❌ Error creating seller:", error);

    if (uploadedFileUrl) {
      try {
        await profilePictureUpload.deleteFromCloudinary(uploadedFileUrl);
      } catch (cloudErr) {
        console.error("❌ Failed to rollback Cloudinary upload:", cloudErr);
      }
    }

    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({
        success: false,
        message: "Seller with this email already exists",
      });
    }

    if (error.code === 11000 && error.keyPattern?.phone) {
      return res.status(409).json({
        success: false,
        message: "Seller with this phone already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @description Seller login
 * @route POST /api/seller/signin-seller
 * @access Public
 */
exports.loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    let seller = await Seller.findOne({ email });

    if (!seller) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (seller.status === "BANNED") {
      return res.status(403).json({
        success: false,
        message: "Cannot login, your account has been permanently banned.",
      });
    }

    if (seller.status === "SUSPENDED") {
      const now = new Date();
      if (seller.suspension?.endAt && now < seller.suspension.endAt) {
        return res.status(403).json({
          success: false,
          message: "Your account is temporarily suspended.",
        });
      } else {
        seller.status = "ACTIVE";
        seller.suspension = null;
        await seller.save();
      }
    }

    if (seller.lockUntil && seller.lockUntil > Date.now()) {
      const remaining = Math.ceil((seller.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account locked. Try again in ${remaining} minutes.`,
      });
    }

    if (seller.lockUntil && seller.lockUntil <= Date.now()) {
      await Seller.updateOne(
        { _id: seller._id },
        { $set: { loginAttempts: 0, lockUntil: null } }
      );
      seller.loginAttempts = 0;
      seller.lockUntil = null;
    }

    const isMatch = await bcrypt.compare(password, seller.password);

    if (!isMatch) {
      const updated = await Seller.findOneAndUpdate(
        { _id: seller._id },
        { $inc: { loginAttempts: 1 } },
        { new: true }
      );

      if (updated.loginAttempts >= 3) {
        const lockTime = Date.now() + 30 * 60 * 1000;
        await Seller.updateOne(
          { _id: seller._id },
          { $set: { lockUntil: lockTime } }
        );
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
    const updatedUser = await Seller.findOneAndUpdate(
      { _id: seller._id },
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

    const payload = {
      role: "SELLER",
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

        res.cookie("accessToken", token, {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 60 * 60 * 1000,
        });

        res.json({
          success: true,
          message: "Seller login successful",
          seller: {
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
    console.error("🔥 Seller login Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error logging in" });
  }
};

/**
 * @description Get seller profile by ID
 * @route GET /api/seller/get-seller-by-id/:id
 * @access Private (Seller)
 */
exports.getSellerById = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Seller ID" });
  }
  try {
    const seller = await Seller.findById(id).select(
      "-password -loginAttempts -lockUntil -sessionId -deletionRequest"
    );

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Seller fetched successfully.",
      seller,
    });
  } catch (err) {
    console.error("❌ Error fetching seller by ID:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @description Update seller profile
 * @route PUT /api/seller/update-seller/:id
 * @access Private (Seller)
 */
exports.updateSeller = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Seller ID" });
  }

  try {
    let seller = await Seller.findById(id);

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found." });
    }

    if (req.body.userName) seller.userName = req.body.userName;

    if (req.files && req.files.profilePicture) {
      const newProfilePicture = req.files.profilePicture[0];

      let publicId = null;

      if (seller.profilePicture) {
        const matches = seller.profilePicture.match(
          /\/(?:image|raw)\/upload\/(?:v\d+\/)?([^?]+)/
        );
        if (matches && matches.length >= 2) {
          publicId = matches[1].replace(/\.[^.]+$/, "");
        }
      }

      const result = await uploadToCloudinary(
        newProfilePicture,
        "profilePicture",
        publicId
      );

      seller.profilePicture = result.url;
    }

    await seller.save();

    return res.status(201).json({
      success: true,
      message: "Seller updated successfully.",
      seller,
    });
  } catch (err) {
    console.error("❌ Error updating seller:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @description Reset seller password
 * @route PATCH /api/seller/reset-seller-password
 * @access Private (Seller)
 */
exports.resetSellerPassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
    }

    let seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(404).json({
        success: false,
        message:
          "If an account with that email exists, a password reset email has been sent",
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      seller.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const isSameAsCurrent = await bcrypt.compare(newPassword, seller.password);
    if (isSameAsCurrent) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as the current password",
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    seller.password = hashedPassword;
    seller.passwordChangedAt = new Date();
    seller.sessionId = generateSecureToken();
    await seller.save();

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
 * @description Logout seller
 * @route POST /api/seller/logout-seller
 * @access Private (Seller)
 */
exports.logoutSeller = async (req, res, next) => {
  try {
    if (req.user && req.user.id) {
      await Seller.findByIdAndUpdate(req.user.id, {
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

/**
 * @description Request seller account deletion
 * @route POST /api/seller/request-deletion-account
 * @access Private (Seller)
 */
exports.requestSellerDeletion = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid Seller ID",
      });
    }

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid reason for account deletion",
      });
    }

    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    if (seller.deletionRequest && seller.deletionRequest.status === "PENDING") {
      return res.status(400).json({
        success: false,
        message:
          "You already submitted a deletion request. Please wait for review.",
      });
    }

    seller.deletionRequest = {
      status: "PENDING",
      reason: reason.trim(),
      requestedAt: new Date(),
    };

    await seller.save();

    res.status(201).json({
      success: true,
      message:
        "Deletion request submitted successfully. Awaiting SuperAdmin review.",
      request: seller.deletionRequest,
    });
  } catch (error) {
    console.error("Error requesting seller deletion:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @description Forgot Password - Send reset link to email
 * @route POST /api/seller/forgot-password
 * @access Public
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const seller = await Seller.findOne({ email: email.toLowerCase() });

    if (!seller) {
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000;

    seller.passwordResetToken = resetToken;
    seller.passwordResetExpires = resetTokenExpiry;
    await seller.save();

    const emailSent = await sendPasswordResetEmail(email, resetToken);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email",
      });
    }

    res.status(200).json({
      success: true,
      message: "Link sent successfully! Please check your email",
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @description Reset Password with token
 * @route POST /api/seller/reset-password/:token
 * @access Public
 */
exports.resetPasswordWithToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
    }

    const seller = await Seller.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!seller) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const isSameAsCurrent = await bcrypt.compare(newPassword, seller.password);
    if (isSameAsCurrent) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as the current password",
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    seller.password = hashedPassword;
    seller.passwordResetToken = null;
    seller.passwordResetExpires = null;
    seller.passwordChangedAt = new Date();
    seller.sessionId = generateSecureToken();

    await seller.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @description Verify reset token validity
 * @route GET /api/seller/verify-reset-token/:token
 * @access Public
 */
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const seller = await Seller.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!seller) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    res.status(200).json({
      success: true,
      message: "Valid reset token",
    });
  } catch (error) {
    console.error("Error verifying reset token:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
