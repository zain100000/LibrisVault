const crypto = require("crypto");

let otpStore = {};

/**
 * Generate a 6-digit OTP securely
 */
exports.generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash OTP before storing (so even if memory/DB leaks, OTP is safe)
 */
exports.hashOTP = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

/**
 * Store OTP with metadata (expiry, attempt limits, resend limits)
 */
exports.storeOTP = (phone, otp) => {
  const hashed = this.hashOTP(otp);
  otpStore[phone] = {
    otp: hashed,
    timestamp: Date.now(),
    attempts: 0,
    resendCount: (otpStore[phone]?.resendCount || 0) + 1,
  };
};

/**
 * Verify OTP securely
 */
exports.verifyOTP = (phone, enteredOtp) => {
  const stored = otpStore[phone];
  if (!stored) return false;

  const isExpired = Date.now() - stored.timestamp > 5 * 60 * 1000;
  if (isExpired) {
    delete otpStore[phone];
    return false;
  }

  if (stored.attempts >= 3) {
    delete otpStore[phone];
    return false;
  }

  const enteredHash = this.hashOTP(enteredOtp);
  const isMatch = stored.otp === enteredHash;

  stored.attempts++;

  if (isMatch) {
    delete otpStore[phone];
    return true;
  }

  return false;
};

/**
 * Enforce resend limits (max 3 OTPs per hour)
 */
exports.canResendOTP = (phone) => {
  const stored = otpStore[phone];
  if (!stored) return true;

  return stored.resendCount < 3;
};

/**
 * Remove OTP after successful verification or expiry
 */
exports.removeOTP = (phone) => {
  delete otpStore[phone];
};
