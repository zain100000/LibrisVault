const {
  generateOTP,
  storeOTP,
  verifyOTP,
  canResendOTP,
  removeOTP,
} = require("../../utilities/otp/otp.utility");
const Seller = require("../../models/seller.models/seller-model");

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

    if (!canResendOTP(phone)) {
      return res.status(429).json({
        success: false,
        message:
          "OTP resend limit reached. Please try again after a few minutes.",
      });
    }

    const otp = generateOTP();
    storeOTP(phone, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp,
    });
  } catch (err) {
    console.error("❌ Error sending Seller OTP:", err);
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

    res.status(200).json({
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
