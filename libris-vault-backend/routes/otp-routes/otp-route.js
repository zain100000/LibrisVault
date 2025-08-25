const express = require("express");
const router = express.Router();
const otpController = require("../../controllers/otp-controllers/otp-controller");

/**
 * @description Routes for OTP
 */
router.post("/send-otp", otpController.sendSellerOTP);

/**
 * @description Route to Verify OTP
 */
router.post("/verify-otp", otpController.verifySellerOTP);

module.exports = router;
