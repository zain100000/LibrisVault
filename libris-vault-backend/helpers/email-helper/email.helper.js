const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ===== Generic email wrapper =====
const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"LIBRIS VAULT" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error("Failed to send email:", err.message);
    return false;
  }
};

// ===== OTP Email =====
exports.sendOTPEmail = async (toEmail, otp) => {
  return sendEmail({
    to: toEmail,
    subject: "🔐 Your LIBRIS VAULT OTP Code",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin:auto; padding:30px; background:#fafafa; border-radius:12px;">
        <div style="text-align:center; margin-bottom:25px;">
          <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1756135273/LibrisVault/logo/logo_uddfxb.jpg" alt="LIBRIS VAULT" style="width:140px;" />
        </div>
        <h2 style="color:#1a73e8; text-align:center;">Your OTP Code</h2>
        <p style="text-align:center; font-size:24px; font-weight:bold; margin:20px 0; color:#1a73e8;">${otp}</p>
        <p style="text-align:center; color:#888;">This OTP will expire in 5 minutes. Do not share it with anyone.</p>
        <hr style="margin:20px 0; border-top:1px solid #e0e0e0;" />
        <p style="text-align:center; color:#aaa; font-size:12px;">If you did not request this OTP, please ignore this email.</p>
      </div>
    `,
  });
};

// ===== Password Reset =====
exports.sendPasswordResetEmail = async (toEmail, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  return sendEmail({
    to: toEmail,
    subject: "🔐 Reset Your LIBRIS VAULT Password",
    html: `
      <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width:600px; margin:auto; padding:30px; background:#fafafa; border-radius:12px;">
        <div style="text-align:center; margin-bottom:25px;">
          <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1756135273/LibrisVault/logo/logo_uddfxb.jpg" alt="LIBRIS VAULT" style="width:140px;" />
        </div>
        <h2 style="color:#1a73e8; text-align:center;">Password Reset Request</h2>
        <p style="text-align:center;">Click the button below to reset your password:</p>
        <div style="text-align:center; margin:20px 0;">
          <a href="${resetLink}" style="display:inline-block; padding:12px 24px; background-color:#1a73e8; color:white; border-radius:6px; text-decoration:none;">Reset Password</a>
        </div>
        <p style="text-align:center; color:#888;">This link expires in 1 hour.</p>
        <hr style="margin:20px 0; border-top:1px solid #e0e0e0;" />
        <p style="text-align:center; color:#aaa; font-size:12px;">Or copy-paste this link: ${resetLink}</p>
      </div>
    `,
  });
};

// ===== Promotion Email =====
exports.sendPromotionEmail = async (toEmail, promotion) => {
  return sendEmail({
    to: toEmail,
    subject: `🎉 New Promotion: ${promotion.title}`,
    html: `
      <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width:600px; margin:auto; padding:30px; background:#fafafa; border-radius:12px;">
        <div style="text-align:center; margin-bottom:25px;">
          <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1756135273/LibrisVault/logo/logo_uddfxb.jpg" alt="LIBRIS VAULT" style="width:140px;" />
        </div>
        <h2 style="text-align:center; color:#1a73e8;">${promotion.title}</h2>
        <p style="text-align:center; color:#333; font-size:16px;">${promotion.description || "Don't miss this amazing deal!"}</p>
        <div style="text-align:center; margin-top:20px;">
          <p><strong>Start Date:</strong> ${new Date(promotion.startDate).toLocaleDateString()}</p>
          <p><strong>End Date:</strong> ${new Date(promotion.endDate).toLocaleDateString()}</p>
        </div>
        <hr style="margin:20px 0; border-top:1px solid #e0e0e0;" />
        <p style="text-align:center; color:#888; font-size:14px;">You are receiving this email because you are subscribed to LIBRIS VAULT notifications.</p>
      </div>
    `,
  });
};

// ===== Book Request Notification to Seller =====
exports.sendBookRequestNotificationToSeller = async (toEmail, data) => {
  const {
    storeName,
    userName,
    requestedTitle,
    requestedAuthor,
    message,
    status,
  } = data;
  return sendEmail({
    to: toEmail,
    subject: `📚 New Book Request for ${storeName}`,
    html: `
      <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width:600px; margin:auto; padding:30px; background:#fafafa; border-radius:12px;">
        <div style="text-align:center; margin-bottom:25px;">
          <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1756135273/LibrisVault/logo/logo_uddfxb.jpg" alt="LIBRIS VAULT" style="width:140px;" />
        </div>
        <h2 style="color:#2c3e50; text-align:center;">New Book Request</h2>
        <div style="background:white; padding:20px; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
          <p><strong>User:</strong> ${userName || "Unknown User"}</p>
          <p><strong>Store:</strong> ${storeName}</p>
          <p><strong>Title:</strong> ${requestedTitle}</p>
          <p><strong>Author:</strong> ${requestedAuthor}</p>
          <p><strong>Message:</strong> ${message || "No message"}</p>
          <p><strong>Status:</strong> <span style="color:#3498db;">${status}</span></p>
        </div>
        <p style="text-align:center; color:#888; margin-top:20px; font-size:14px;">This is an automated notification regarding a book request.</p>
      </div>
    `,
  });
};

// ===== Book Request Status to User =====
exports.sendBookRequestStatusToUser = async (toEmail, request) => {
  const statusColors = {
    APPROVED: "#27ae60",
    REJECTED: "#e74c3c",
    PENDING: "#f39c12",
  };
  const statusIcons = { APPROVED: "✅", REJECTED: "❌", PENDING: "⏳" };
  const statusMessages = {
    APPROVED: "Great news! Your request has been approved.",
    REJECTED: "Unfortunately, your request was rejected.",
    PENDING: "Your request is still pending review.",
  };

  return sendEmail({
    to: toEmail,
    subject: `📢 Update on Your Book Request: ${request.requestedTitle}`,
    html: `
      <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width:600px; margin:auto; padding:30px; background:#fafafa; border-radius:12px;">
        <div style="text-align:center; margin-bottom:25px;">
          <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1756135273/LibrisVault/logo/logo_uddfxb.jpg" alt="LIBRIS VAULT" style="width:140px;" />
        </div>
        <h2 style="text-align:center; color:#2c3e50;">Book Request Update</h2>
        <div style="background:white; padding:20px; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.05); margin-bottom:20px;">
          <p><strong>Title:</strong> ${request.requestedTitle}</p>
          <p><strong>Author:</strong> ${request.requestedAuthor}</p>
          <p><strong>Status:</strong> <span style="color:${statusColors[request.status]}">${request.status}</span></p>
        </div>
        <p style="background:${statusColors[request.status]}15; padding:16px; border-left:4px solid ${statusColors[request.status]}; border-radius:8px; color:${statusColors[request.status]}; font-weight:500;">
          ${statusIcons[request.status]} ${statusMessages[request.status]}
        </p>
        <p style="text-align:center; color:#888; margin-top:20px; font-size:14px;">Thank you for your continued partnership.</p>
      </div>
    `,
  });
};

// ===== Order Confirmation to User =====
exports.sendOrderConfirmationToUser = async (toEmail, order) => {
  const itemsList = order.items
    .map((i) => `${i.bookTitle} (x${i.quantity}) - $${i.price}`)
    .join("<br>");
  return sendEmail({
    to: toEmail,
    subject: "✅ Your Order Has Been Placed Successfully",
    html: `
      <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width:600px; margin:auto; padding:30px; background:#fafafa; border-radius:12px;">
        <div style="text-align:center; margin-bottom:25px;">
          <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1756135273/LibrisVault/logo/logo_uddfxb.jpg" style="width:140px;" />
        </div>
        <h2 style="text-align:center; color:#1a73e8;">Thank You for Your Order!</h2>
        <p style="text-align:center;">Your order has been placed successfully. Here are the details:</p>
        <div style="background:white; padding:20px; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.05); margin-bottom:20px;">
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Total Amount:</strong> $${order.totalAmount}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Order Status:</strong> ${order.status}</p>
        </div>
        <p><strong>Items Ordered:</strong><br>${itemsList}</p>
        <p style="text-align:center; color:#888; margin-top:20px; font-size:14px;">We’ll notify you when your order is shipped.</p>
      </div>
    `,
  });
};

// ===== New Order Notification to Seller =====
exports.sendNewOrderNotificationToSeller = async (toEmail, order, user) => {
  const itemsList = order.items
    .map((i) => `${i.bookTitle} (x${i.quantity}) - $${i.price}`)
    .join("<br>");
  return sendEmail({
    to: toEmail,
    subject: `📦 New Order Received (Order ID: ${order._id})`,
    html: `
      <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width:600px; margin:auto; padding:30px; background:#fafafa; border-radius:12px;">
        <div style="text-align:center; margin-bottom:25px;">
          <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1756135273/LibrisVault/logo/logo_uddfxb.jpg" style="width:140px;" />
        </div>
        <h2 style="text-align:center; color:#1a73e8;">New Order Notification</h2>
        <p>You have received a new order from <strong>${user.userName}</strong></p>
        <div style="background:white; padding:20px; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.05); margin-bottom:20px;">
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Total Amount:</strong> $${order.totalAmount}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
        </div>
        <p><strong>Items Ordered:</strong><br>${itemsList}</p>
        <p style="text-align:center; color:#888; margin-top:20px; font-size:14px;">Please process this order promptly.</p>
      </div>
    `,
  });
};

// ===== Order Cancelled Notification to User =====
exports.sendOrderCancelledToUser = async (toEmail, order) => {
  const itemsList = order.items
    .map((i) => `${i.bookTitle} (x${i.quantity}) - $${i.price}`)
    .join("<br>");

  return sendEmail({
    to: toEmail,
    subject: `❌ Your Order Has Been Cancelled (ID: ${order._id})`,
    html: `
      <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width:600px; margin:auto; padding:30px; background:#fff5f5; border-radius:12px;">
        <div style="text-align:center; margin-bottom:25px;">
          <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1756135273/LibrisVault/logo/logo_uddfxb.jpg" style="width:140px;" />
        </div>
        <h2 style="text-align:center; color:#e74c3c;">Order Cancelled</h2>
        <p style="text-align:center;">Your order has been cancelled. Here are the details:</p>
        <div style="background:white; padding:20px; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.05); margin-bottom:20px;">
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Total Amount:</strong> $${order.totalAmount}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Order Status:</strong> ${order.status}</p>
        </div>
        <p><strong>Items Ordered:</strong><br>${itemsList}</p>
        <p style="text-align:center; color:#888; margin-top:20px; font-size:14px;">If payment was made, a refund will be processed (if applicable).</p>
      </div>
    `,
  });
};

// ===== Order Cancelled Notification to Seller =====
exports.sendOrderCancelledToSeller = async (toEmail, order, user) => {
  const itemsList = order.items
    .map((i) => `${i.bookTitle} (x${i.quantity}) - $${i.price}`)
    .join("<br>");

  return sendEmail({
    to: toEmail,
    subject: `⚠️ Order Cancelled by ${user.userName} (Order ID: ${order._id})`,
    html: `
      <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width:600px; margin:auto; padding:30px; background:#fff8e6; border-radius:12px;">
        <div style="text-align:center; margin-bottom:25px;">
          <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1756135273/LibrisVault/logo/logo_uddfxb.jpg" style="width:140px;" />
        </div>
        <h2 style="text-align:center; color:#e67e22;">Order Cancelled</h2>
        <p>The following order was cancelled by <strong>${user.userName}</strong>:</p>
        <div style="background:white; padding:20px; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.05); margin-bottom:20px;">
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Total Amount:</strong> $${order.totalAmount}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
        </div>
        <p><strong>Items Ordered:</strong><br>${itemsList}</p>
        <p style="text-align:center; color:#888; margin-top:20px; font-size:14px;">No further action is required for this order.</p>
      </div>
    `,
  });
};
