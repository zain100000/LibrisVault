const nodemailer = require("nodemailer");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send OTP to user's Gmail
 * @param {string} toEmail - Receiver's email
 * @param {string} otp - OTP to send
 */
exports.sendOTPEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"LIBRIS VAULT" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "🔐 Your LIBRIS VAULT OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; text-align: center;">
        <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1756135273/LibrisVault/logo/logo_uddfxb.jpg" alt="LIBRIS VAULT" style="width:120px;" />
        <h2>LIBRIS VAULT</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <p style="font-size: 28px; font-weight: bold; color: #1a73e8; margin: 20px 0;">${otp}</p>
        <p style="font-size: 14px; color: #888;">This OTP will expire in 5 minutes. Please do not share it with anyone.</p>
        <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #aaa;">If you did not request this code, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error("Failed to send OTP via Gmail:", err.message);
    return false;
  }
};

/**
 * Send Password Reset Email
 * @param {string} toEmail - Receiver's email
 * @param {string} resetToken - Password reset token
 */
exports.sendPasswordResetEmail = async (toEmail, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"LIBRIS VAULT" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "🔐 Reset Your LIBRIS VAULT Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; text-align: center;">
        <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1756135273/LibrisVault/logo/logo_uddfxb.jpg" alt="LIBRIS VAULT" style="width:120px;" />
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        <a href="${resetLink}" style="display: inline-block; background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
        <p style="font-size: 14px; color: #888;">This link will expire in 1 hour for security reasons.</p>
        <p style="font-size: 12px; color: #aaa;">If you didn't request this password reset, please ignore this email.</p>
        <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #888;">Or copy and paste this link in your browser:<br>${resetLink}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error("Failed to send password reset email:", err.message);
    return false;
  }
};

/**
 * Send Promotion Notification Email
 * @param {string} toEmail - Receiver's email
 * @param {object} promotion - Promotion details { title, description, startDate, endDate }
 */
exports.sendPromotionEmail = async (toEmail, promotion) => {
  const mailOptions = {
    from: `"LIBRIS VAULT" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `🎉 New Promotion: ${promotion.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1756135273/LibrisVault/logo/logo_uddfxb.jpg" alt="LIBRIS VAULT" style="width:120px; display:block; margin:auto;" />
        <h2 style="color:#1a73e8; text-align:center;">${promotion.title}</h2>
        <p style="font-size: 16px; color: #333; text-align:center;">${promotion.description || "Don't miss out on this amazing deal!"}</p>
        
        <div style="margin-top:20px; text-align:center;">
          <p><b>Start Date:</b> ${new Date(promotion.startDate).toLocaleDateString()}</p>
          <p><b>End Date:</b> ${new Date(promotion.endDate).toLocaleDateString()}</p>
        </div>

        <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">

        <p style="font-size: 14px; color: #888; text-align:center;">
          You are receiving this email because you are subscribed to LIBRIS VAULT notifications.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error("Failed to send Promotion email:", err.message);
    return false;
  }
};

/**
 * Send Book Request Notification Email to Seller
 * @param {string} toEmail - Seller email
 * @param {object} request - Request details { requestedTitle, requestedAuthor, message, status }
 */
exports.sendBookRequestNotificationToSeller = async (toEmail, request) => {
  const mailOptions = {
    from: `"LIBRIS VAULT" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "📚 New Book Request from a User",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1756135273/LibrisVault/logo/logo_uddfxb.jpg" alt="LIBRIS VAULT" style="width:120px; display:block; margin:auto;" />
        <h2 style="text-align:center;">New Book Request</h2>
        <p>A user has requested a new book in your store:</p>

        <ul style="font-size: 16px; color: #333;">
          <li><b>Title:</b> ${request.requestedTitle}</li>
          <li><b>Author:</b> ${request.requestedAuthor}</li>
          <li><b>Message:</b> ${request.message || "N/A"}</li>
          <li><b>Status:</b> ${request.status}</li>
        </ul>

        <p style="font-size: 14px; color: #888;">Please check your store inbox to manage this request.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error(
      "Failed to send Book Request Notification to Seller:",
      err.message
    );
    return false;
  }
};

/**
 * Send Book Request Status Update Email to User
 * @param {string} toEmail - User email
 * @param {object} request - Request details { requestedTitle, requestedAuthor, status }
 */
exports.sendBookRequestStatusToUser = async (toEmail, request) => {
  const mailOptions = {
    from: `"LIBRIS VAULT" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `📢 Update on Your Book Request: ${request.requestedTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1756135273/LibrisVault/logo/logo_uddfxb.jpg" alt="LIBRIS VAULT" style="width:120px; display:block; margin:auto;" />
        <h2 style="text-align:center;">Your Book Request Update</h2>
        <p>We have an update regarding your requested book:</p>

        <ul style="font-size: 16px; color: #333;">
          <li><b>Title:</b> ${request.requestedTitle}</li>
          <li><b>Author:</b> ${request.requestedAuthor}</li>
          <li><b>Status:</b> ${request.status}</li>
        </ul>

        ${
          request.status === "APPROVED"
            ? `<p style="font-size: 16px; color: green;">✅ Great news! Your request has been approved. We will add this title to the store soon.</p>`
            : request.status === "REJECTED"
              ? `<p style="font-size: 16px; color: red;">❌ Unfortunately, your request was rejected by the seller.</p>`
              : `<p style="font-size: 16px; color: orange;">⏳ Your request is still pending review.</p>`
        }

        <p style="font-size: 14px; color: #888;">Thank you for using LIBRIS VAULT.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error(
      "Failed to send Book Request Status Email to User:",
      err.message
    );
    return false;
  }
};
