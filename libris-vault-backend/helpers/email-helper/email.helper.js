const nodemailer = require("nodemailer");

/**
 * Send OTP to user's Gmail
 * @param {string} toEmail - Receiver's email
 * @param {string} otp - OTP to send
 */
exports.sendOTPEmail = async (toEmail, otp) => {
  console.log("📧 Preparing to send OTP via Gmail...");
  console.log("➡️ Target email:", toEmail);
  console.log("➡️ OTP to send:", otp);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    logger: true,
    debug: true,
  });

  const mailOptions = {
    from: `"LIBRIS VAULT" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}. It will expire in 5 minutes.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent successfully!");
    console.log("📄 Message ID:", info.messageId);
    return true;
  } catch (err) {
    console.error("❌ Failed to send OTP via Gmail:", err.message);
    return false;
  }
};
