const express = require("express");
const router = express.Router();
const otpController = require("../../controllers/otp-controllers/otp-controller");

/**
 * @description Route to send an OTP to a user.
 */
router.post("/send-otp", otpController.sendSellerOTP);

/**
 * @description Route to verify a user's OTP.
 */
router.post("/verify-otp", otpController.verifySellerOTP);

module.exports = router;
