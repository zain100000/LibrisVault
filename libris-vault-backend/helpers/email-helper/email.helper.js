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
    subject: "🔐 Your OTP Code for Verification",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center;">
        <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1756135273/LibrisVault/logo/logo_uddfxb.jpg" alt="LIBRIS VAULT" style="width: 120px; margin-bottom: 20px;" />
        <h2 style="color: #333;">LIBRIS VAULT</h2>
        <p style="font-size: 16px; color: #555;">Your One-Time Password (OTP) is:</p>
        <p style="font-size: 28px; font-weight: bold; color: #1a73e8; margin: 20px 0;">${otp}</p>
        <p style="font-size: 14px; color: #888;">
          This OTP will expire in 5 minutes. Please do not share it with anyone.
        </p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #aaa;">If you did not request this code, please ignore this email.</p>
      </div>
    </div>
  `,
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
