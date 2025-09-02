const {
  generateOTP,
  storeOTP,
  verifyOTP,
  canResendOTP,
  removeOTP,
} = require("../../utilities/otp/otp.utility");
const Seller = require("../../models/seller-models/seller-model");
const { sendOTPEmail } = require("../../helpers/email-helper/email.helper");

let verifiedSellerPhones = new Set();
exports.verifiedSellerPhones = verifiedSellerPhones;

/**
 * @description Send OTP to seller's phone for verification
 * @route POST /api/otp/send-otp
 * @access Public
 */
exports.sendSellerOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
    }

    const seller = await Seller.findOne({ phone });

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    if (!seller.email) {
      return res
        .status(400)
        .json({ success: false, message: "Seller does not have an email" });
    }

    if (!canResendOTP(phone)) {
      return res.status(429).json({
        success: false,
        message:
          "OTP resend limit reached. Please try again after a few minutes.",
      });
    }

    const otp = generateOTP();

    storeOTP(phone, otp);

    const sent = await sendOTPEmail(seller.email, otp);

    if (!sent) {
      console.error("❌ Failed to send OTP email to:", seller.email);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send OTP email" });
    }

    res.status(201).json({
      success: true,
      message: "OTP sent successfully, please check your email",
    });
  } catch (err) {
    console.error("❌ Error in sendSellerOTP handler:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error while sending OTP" });
  }
};

/**
 * @description Verify seller's phone using OTP
 * @route POST /api/otp/verify-otp
 * @access Public
 */
exports.verifySellerOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Phone and OTP are required" });
    }

    const isValid = verifyOTP(phone, otp);

    if (!isValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    const updatedSeller = await Seller.findOneAndUpdate(
      { phone: phone },
      {
        isPhoneVerified: true,
        phoneVerification: {
          otp: null,
          expiresAt: null,
          attempts: 0,
        },
      },
      { new: true }
    );

    if (!updatedSeller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    verifiedSellerPhones.add(phone);
    removeOTP(phone);

    res.status(201).json({
      success: true,
      message: "Phone verified successfully",
      data: updatedSeller,
    });
  } catch (err) {
    console.error("❌ Error verifying Seller OTP:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error while verifying OTP" });
  }
};
