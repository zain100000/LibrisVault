// const nodemailer = require("nodemailer");
// const crypto = require("crypto");

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// /**
//  * Send OTP to user's Gmail
//  * @param {string} toEmail - Receiver's email
//  * @param {string} otp - OTP to send
//  */
// exports.sendOTPEmail = async (toEmail, otp) => {
//   const mailOptions = {
//     from: `"LIBRIS VAULT" <${process.env.EMAIL_USER}>`,
//     to: toEmail,
//     subject: "🔐 Your LIBRIS VAULT OTP Code",
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; text-align: center;">
//         <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1756135273/LibrisVault/logo/logo_uddfxb.jpg" alt="LIBRIS VAULT" style="width:120px;" />
//         <h2>LIBRIS VAULT</h2>
//         <p>Your One-Time Password (OTP) is:</p>
//         <p style="font-size: 28px; font-weight: bold; color: #1a73e8; margin: 20px 0;">${otp}</p>
//         <p style="font-size: 14px; color: #888;">This OTP will expire in 5 minutes. Please do not share it with anyone.</p>
//         <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
//         <p style="font-size: 12px; color: #aaa;">If you did not request this code, please ignore this email.</p>
//       </div>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     return true;
//   } catch (err) {
//     console.error("Failed to send OTP via Gmail:", err.message);
//     return false;
//   }
// };

// /**
//  * Send Password Reset Email
//  * @param {string} toEmail - Receiver's email
//  * @param {string} resetToken - Password reset token
//  */
// exports.sendPasswordResetEmail = async (toEmail, resetToken) => {
//   const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

//   const mailOptions = {
//     from: `"LIBRIS VAULT" <${process.env.EMAIL_USER}>`,
//     to: toEmail,
//     subject: "🔐 Reset Your LIBRIS VAULT Password",
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; text-align: center;">
//         <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1756135273/LibrisVault/logo/logo_uddfxb.jpg" alt="LIBRIS VAULT" style="width:120px;" />
//         <h2>Password Reset Request</h2>
//         <p>You requested to reset your password. Click the button below to create a new password:</p>
//         <a href="${resetLink}" style="display: inline-block; background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
//         <p style="font-size: 14px; color: #888;">This link will expire in 1 hour for security reasons.</p>
//         <p style="font-size: 12px; color: #aaa;">If you didn't request this password reset, please ignore this email.</p>
//         <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
//         <p style="font-size: 12px; color: #888;">Or copy and paste this link in your browser:<br>${resetLink}</p>
//       </div>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     return true;
//   } catch (err) {
//     console.error("Failed to send password reset email:", err.message);
//     return false;
//   }
// };

// /**
//  * Send Promotion Notification Email
//  * @param {string} toEmail - Receiver's email
//  * @param {object} promotion - Promotion details { title, description, startDate, endDate }
//  */
// exports.sendPromotionEmail = async (toEmail, promotion) => {
//   const mailOptions = {
//     from: `"LIBRIS VAULT" <${process.env.EMAIL_USER}>`,
//     to: toEmail,
//     subject: `🎉 New Promotion: ${promotion.title}`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
//         <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1756135273/LibrisVault/logo/logo_uddfxb.jpg" alt="LIBRIS VAULT" style="width:120px; display:block; margin:auto;" />
//         <h2 style="color:#1a73e8; text-align:center;">${promotion.title}</h2>
//         <p style="font-size: 16px; color: #333; text-align:center;">${promotion.description || "Don't miss out on this amazing deal!"}</p>

//         <div style="margin-top:20px; text-align:center;">
//           <p><b>Start Date:</b> ${new Date(promotion.startDate).toLocaleDateString()}</p>
//           <p><b>End Date:</b> ${new Date(promotion.endDate).toLocaleDateString()}</p>
//         </div>

//         <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">

//         <p style="font-size: 14px; color: #888; text-align:center;">
//           You are receiving this email because you are subscribed to LIBRIS VAULT notifications.
//         </p>
//       </div>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     return true;
//   } catch (err) {
//     console.error("Failed to send Promotion email:", err.message);
//     return false;
//   }
// };

// /**
//  * Send Book Request Notification Email to Seller
//  * @param {string} toEmail - Seller email
//  * @param {object} request - Request details { requestedTitle, requestedAuthor, message, status }
//  */
// exports.sendBookRequestNotificationToSeller = async (toEmail, data) => {
//   const {
//     storeName,
//     userName,
//     requestedTitle,
//     requestedAuthor,
//     message,
//     status,
//   } = data;

//   const mailOptions = {
//     from: `"LIBRIS VAULT" <${process.env.EMAIL_USER}>`,
//     to: toEmail,
//     subject: `📚 New Book Request for ${storeName}`,
//     html: `
//       <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e8e8e8; border-radius: 12px; background: #fafafa;">
//         <div style="text-align: center; margin-bottom: 25px;">
//           <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1756135273/LibrisVault/logo/logo_uddfxb.jpg" alt="LIBRIS VAULT" style="width:150px;"/>
//         </div>

//         <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
//           <h2 style="color: #2c3e50; text-align: center; margin-bottom: 25px; font-weight: 600;">New Book Request</h2>

//           <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
//             <p style="margin: 8px 0; color: #34495e;"><strong style="color: #2c3e50;">User:</strong> ${userName || "Unknown User"}</p>
//             <p style="margin: 8px 0; color: #34495e;"><strong style="color: #2c3e50;">Store:</strong> ${storeName}</p>
//             <p style="margin: 8px 0; color: #34495e;"><strong style="color: #2c3e50;">Title:</strong> ${requestedTitle}</p>
//             <p style="margin: 8px 0; color: #34495e;"><strong style="color: #2c3e50;">Author:</strong> ${requestedAuthor}</p>
//             <p style="margin: 8px 0; color: #34495e;"><strong style="color: #2c3e50;">Message:</strong> ${message || "No additional message"}</p>
//             <p style="margin: 8px 0; color: #34495e;"><strong style="color: #2c3e50;">Status:</strong> <span style="color: #3498db; font-weight: 500;">${status}</span></p>
//           </div>

//           <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee;">
//             <p style="font-size: 14px; color: #7f8c8d;">This is an automated notification regarding a book request.</p>
//           </div>
//         </div>
//       </div>
//     `,
//   };

//   await transporter.sendMail(mailOptions);
// };

// /**
//  * Send Book Request Status Update Email to User
//  * @param {string} toEmail - User email
//  * @param {object} request - Request details { requestedTitle, requestedAuthor, status }
//  */
// exports.sendBookRequestStatusToUser = async (toEmail, request) => {
//   const statusColors = {
//     APPROVED: "#27ae60",
//     REJECTED: "#e74c3c",
//     PENDING: "#f39c12",
//   };

//   const statusIcons = {
//     APPROVED: "✅",
//     REJECTED: "❌",
//     PENDING: "⏳",
//   };

//   const statusMessages = {
//     APPROVED:
//       "Great news! Your request has been approved. We will add this title to the store soon.",
//     REJECTED: "Unfortunately, your request was rejected by the seller.",
//     PENDING: "Your request is still pending review.",
//   };

//   const mailOptions = {
//     from: `"LIBRIS VAULT" <${process.env.EMAIL_USER}>`,
//     to: toEmail,
//     subject: `📢 Update on Your Book Request: ${request.requestedTitle}`,
//     html: `
//       <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e8e8e8; border-radius: 12px; background: #fafafa;">
//         <div style="text-align: center; margin-bottom: 25px;">
//           <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1756135273/LibrisVault/logo/logo_uddfxb.jpg" alt="LIBRIS VAULT" style="width:150px;"/>
//         </div>

//         <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
//           <h2 style="color: #2c3e50; text-align: center; margin-bottom: 25px; font-weight: 600;">Book Request Update</h2>

//           <p style="color: #34495e; margin-bottom: 20px;">We have an update regarding your requested book:</p>

//           <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
//             <ul style="list-style: none; padding: 0; margin: 0; color: #34495e;">
//               <li style="margin-bottom: 12px; padding-left: 0;"><b>Title:</b> ${request.requestedTitle}</li>
//               <li style="margin-bottom: 12px; padding-left: 0;"><b>Author:</b> ${request.requestedAuthor}</li>
//               <li style="margin-bottom: 0; padding-left: 0;"><b>Status:</b> <span style="color: ${statusColors[request.status]}; font-weight: 500;">${request.status}</span></li>
//             </ul>
//           </div>

//           <div style="background: ${statusColors[request.status]}15; padding: 16px; border-radius: 8px; border-left: 4px solid ${statusColors[request.status]}; margin-bottom: 25px;">
//             <p style="margin: 0; color: ${statusColors[request.status]}; font-weight: 500;">${statusIcons[request.status]} ${statusMessages[request.status]}</p>
//           </div>

//           <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee;">
//             <p style="font-size: 14px; color: #7f8c8d;">Thank you for your continued partnership.</p>
//           </div>
//         </div>
//       </div>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     return true;
//   } catch (err) {
//     console.error(
//       "Failed to send Book Request Status Email to User:",
//       err.message
//     );
//     return false;
//   }
// };

// /**
//  * Send Order Confirmation Email to User
//  * @param {string} toEmail - User email
//  * @param {object} order - Order details
//  */
// exports.sendOrderConfirmationToUser = async (toEmail, order) => {
//   const mailOptions = {
//     from: `"LIBRIS VAULT" <${process.env.EMAIL_USER}>`,
//     to: toEmail,
//     subject: "✅ Your Order Has Been Placed Successfully",
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
//         <h2 style="color:#1a73e8; text-align:center;">Thank You for Your Order!</h2>

//         <p>Hello,</p>
//         <p>Your order has been placed successfully. Here are the details:</p>

//         <div style="margin:20px 0; padding:15px; background:#f9f9f9; border-radius:8px;">
//           <p><strong>Order ID:</strong> ${order._id}</p>
//           <p><strong>Total Amount:</strong> $${order.totalAmount}</p>
//           <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
//           <p><strong>Order Status:</strong> ${order.status}</p>
//         </div>

//         <h3>Items Ordered:</h3>
//         <ul>
//           ${order.items
//             .map(
//               (item) =>
//                 `<li>${item.bookTitle} (x${item.quantity}) - $${item.price}</li>`
//             )
//             .join("")}
//         </ul>

//         <p style="font-size: 14px; color: #888;">We’ll notify you when your order is shipped.</p>
//       </div>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     return true;
//   } catch (err) {
//     console.error(
//       "Failed to send order confirmation email to user:",
//       err.message
//     );
//     return false;
//   }
// };

// /**
//  * Send New Order Notification Email to Seller
//  * @param {string} toEmail - Seller email
//  * @param {object} order - Order details
//  * @param {object} user - User details
//  */
// exports.sendNewOrderNotificationToSeller = async (toEmail, order, user) => {
//   const mailOptions = {
//     from: `"LIBRIS VAULT" <${process.env.EMAIL_USER}>`,
//     to: toEmail,
//     subject: `📦 New Order Received (Order ID: ${order._id})`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
//         <h2 style="color:#1a73e8; text-align:center;">New Order Notification</h2>

//         <p>You have received a new order from <strong>${user.name}</strong> (${user.email}).</p>

//         <div style="margin:20px 0; padding:15px; background:#f9f9f9; border-radius:8px;">
//           <p><strong>Order ID:</strong> ${order._id}</p>
//           <p><strong>Total Amount:</strong> $${order.totalAmount}</p>
//           <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
//           <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
//         </div>

//         <h3>Items Ordered:</h3>
//         <ul>
//           ${order.items
//             .map(
//               (item) =>
//                 `<li>${item.bookTitle} (x${item.quantity}) - $${item.price}</li>`
//             )
//             .join("")}
//         </ul>

//         <p style="font-size: 14px; color: #888;">Please process this order promptly.</p>
//       </div>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     return true;
//   } catch (err) {
//     console.error("Failed to send new order email to seller:", err.message);
//     return false;
//   }
// };

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
        <p>You have received a new order from <strong>${user.userName}</strong> (${user.email}).</p>
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
