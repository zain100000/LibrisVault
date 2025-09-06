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

/**
 * @function sendEmail
 * @description Sends an email using the configured transporter.
 */
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

/**
 * @function getEmailTemplate
 * @description Generates a professional HTML email template with a header, body, and footer.
 */
const getEmailTemplate = (content, title = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f7f9fc;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f7f9fc;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); padding: 30px; text-align: center;">
                            <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1756914446/LibrisVault/logo/logo_zql89r.png" alt="LIBRIS VAULT" style="width: 160px; height: auto;"/>
                            <h1 style="color: white; font-size: 24px; margin: 15px 0 0 0; font-weight: 600;">LIBRIS VAULT</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            ${content}
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
                                &copy; 2024 LIBRIS VAULT. All rights reserved.<br>
                                <span style="font-size: 12px; color: #868e96;">
                                    This email was sent to you as a registered user of LIBRIS VAULT.<br>
                                    If you believe you received this email in error, please contact our support team.
                                </span>
                            </p>                            
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

/**
 * @function getOtpEmail
 * @description Generates a styled OTP (One-Time Password) email using the common template.
 */
exports.sendOTPEmail = async (toEmail, otp) => {
  const content = `
    <div style="text-align: center;">
        <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 20px; font-weight: 600;">Secure Verification Code</h2>
        <p style="color: #4a5568; line-height: 1.6; margin-bottom: 25px;">
            For your security, we require verification to complete this action. Please use the following One-Time Password (OTP) to proceed:
        </p>
        
        <div style="background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); color: white; padding: 20px; border-radius: 12px; margin: 25px 0; display: inline-block;">
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center;">${otp}</div>
        </div>
        
        <p style="color: #e53e3e; font-size: 14px; margin: 20px 0;">
            ⚠️ This code will expire in 5 minutes. Do not share it with anyone.
        </p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 25px;">
            <p style="margin: 0; color: #6c757d; font-size: 13px;">
                If you did not request this verification, please immediately secure your account by changing your password and contact our support team.
            </p>
        </div>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: "Your LIBRIS VAULT Verification Code",
    html: getEmailTemplate(content, "Secure Verification"),
  });
};

/**
 * @function getPasswordResetEmail
 * @description Generates the email template for password reset instructions.
 */
exports.sendPasswordResetEmail = async (toEmail, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/super-admin/reset-password?token=${resetToken}`;
  const content = `
    <div style="text-align: center;">
        <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 20px; font-weight: 600;">Password Reset Request</h2>
        <p style="color: #4a5568; line-height: 1.6; margin-bottom: 25px;">
            We received a request to reset your LIBRIS VAULT account password. Click the button below to create a new password:
        </p>
        
        <div style="margin: 30px 0;">
            <a href="${resetLink}" style="background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                Reset My Password
            </a>
        </div>
        
        <p style="color: #718096; font-size: 14px; margin: 20px 0;">
            This password reset link is valid for 1 hour. If you did not request a password reset, please ignore this email.
        </p>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: "Reset Your LIBRIS VAULT Password",
    html: getEmailTemplate(content, "Password Reset"),
  });
};

/**
 * @function getPromotionEmail
 * @description Generates the email template for notifying users about promotions or discounts.
 */
exports.sendPromotionEmail = async (toEmail, promotion) => {
  const content = `
    <div>
        <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 20px; font-weight: 600; text-align: center;">Special Promotion: ${promotion.title}</h2>
        
        <div style="background: linear-gradient(135deg, #f7f9fc 0%, #edf2f7 100%); padding: 25px; border-radius: 12px; margin-bottom: 25px; text-align: center;">
            <p style="color: #2d3748; font-size: 18px; margin: 0; font-weight: 500;">
                ${promotion.description || "Discover amazing deals and exclusive offers just for you!"}
            </p>
        </div>
        
        <div style="display: flex; justify-content: center; gap: 30px; margin: 30px 0;">
            <div style="text-align: center;">
                <div style="background: #e6f7ff; padding: 15px; border-radius: 8px; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                    <span style="font-size: 32px; color: #1890ff;">📅</span>
                </div>
                <p style="margin: 0; color: #4a5568; font-weight: 600;">Start Date</p>
                <p style="margin: 5px 0 0 0; color: #1a73e8; font-weight: 600;">${new Date(promotion.startDate).toLocaleDateString()}</p>
            </div>
            
            <div style="text-align: center;">
                <div style="background: #fff2e8; padding: 15px; border-radius: 8px; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                    <span style="font-size: 32px; color: #fa8c16;">⏰</span>
                </div>
                <p style="margin: 0; color: #4a5568; font-weight: 600;">End Date</p>
                <p style="margin: 5px 0 0 0; color: #fa8c16; font-weight: 600;">${new Date(promotion.endDate).toLocaleDateString()}</p>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/promotions" style="background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                View All Promotions
            </a>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 30px;">
            <p style="margin: 0; color: #6c757d; font-size: 13px; text-align: center;">
                You are receiving this email because you subscribed to promotional communications from LIBRIS VAULT. 
                <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #1a73e8; text-decoration: none;">Unsubscribe</a>
            </p>
        </div>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: `Exclusive Promotion: ${promotion.title}`,
    html: getEmailTemplate(content, "Special Promotion"),
  });
};

/**
 * @function getBookRequestNotificationEmail
 * @description Generates the email template sent to sellers when a user submits a new book request.
 */
exports.sendBookRequestNotificationToSeller = async (toEmail, data) => {
  const {
    storeName,
    userName,
    requestedTitle,
    requestedAuthor,
    message,
    status,
  } = data;

  const content = `
    <div>
        <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 25px; font-weight: 600;">New Book Request Received</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; color: #4a5568; font-weight: 600;">A customer has requested a book from your store:</p>
        </div>
        
        <table width="100%" style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
                <td style="padding: 15px; border-bottom: 1px solid #e9ecef; color: #4a5568; font-weight: 600;">Customer Name</td>
                <td style="padding: 15px; border-bottom: 1px solid #e9ecef; color: #2d3748;">${userName || "Unknown User"}</td>
            </tr>
            <tr>
                <td style="padding: 15px; border-bottom: 1px solid #e9ecef; color: #4a5568; font-weight: 600;">Store</td>
                <td style="padding: 15px; border-bottom: 1px solid #e9ecef; color: #2d3748;">${storeName}</td>
            </tr>
            <tr>
                <td style="padding: 15px; border-bottom: 1px solid #e9ecef; color: #4a5568; font-weight: 600;">Book Title</td>
                <td style="padding: 15px; border-bottom: 1px solid #e9ecef; color: #2d3748;">${requestedTitle}</td>
            </tr>
            <tr>
                <td style="padding: 15px; border-bottom: 1px solid #e9ecef; color: #4a5568; font-weight: 600;">Author</td>
                <td style="padding: 15px; border-bottom: 1px solid #e9ecef; color: #2d3748;">${requestedAuthor}</td>
            </tr>
            <tr>
                <td style="padding: 15px; border-bottom: 1px solid #e9ecef; color: #4a5568; font-weight: 600;">Customer Message</td>
                <td style="padding: 15px; border-bottom: 1px solid #e9ecef; color: #2d3748;">${message || "No message provided"}</td>
            </tr>
            <tr>
                <td style="padding: 15px; color: #4a5568; font-weight: 600;">Request Status</td>
                <td style="padding: 15px; color: #1a73e8; font-weight: 600;">${status}</td>
            </tr>
        </table>
        
        <div style="background: #e6f7ff; padding: 15px; border-radius: 8px; border-left: 4px solid #1890ff;">
            <p style="margin: 0; color: #1890ff; font-weight: 500;">
                Please review this request in your seller dashboard and update the status accordingly.
            </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/seller/requests" style="background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Manage Requests
            </a>
        </div>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: `New Book Request for ${storeName}`,
    html: getEmailTemplate(content, "New Book Request"),
  });
};

/**
 * @function getBookRequestStatusEmail
 * @description Generates the email template sent to users with updates on their book request status.
 */
exports.sendBookRequestStatusToUser = async (toEmail, request) => {
  const statusColors = {
    APPROVED: "#52c41a",
    REJECTED: "#f5222d",
    PENDING: "#fa8c16",
  };

  const statusIcons = {
    APPROVED: "✅",
    REJECTED: "❌",
    PENDING: "⏳",
  };

  const statusMessages = {
    APPROVED:
      "Your book request has been approved. The seller will contact you soon regarding availability and pricing.",
    REJECTED:
      "Unfortunately, your book request could not be fulfilled at this time.",
    PENDING: "Your request is currently under review by the seller.",
  };

  const content = `
    <div>
        <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 25px; font-weight: 600;">Book Request Update</h2>
        
        <div style="background: ${statusColors[request.status]}15; padding: 20px; border-radius: 8px; border-left: 4px solid ${statusColors[request.status]}; margin-bottom: 25px;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <span style="font-size: 24px;">${statusIcons[request.status]}</span>
                <div>
                    <h3 style="margin: 0; color: ${statusColors[request.status]}; font-weight: 600;">Request ${request.status}</h3>
                    <p style="margin: 5px 0 0 0; color: #4a5568;">${statusMessages[request.status]}</p>
                </div>
            </div>
        </div>
        
        <table width="100%" style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; border-collapse: collapse;">
            <tr>
                <td style="padding: 15px; border-bottom: 1px solid #e9ecef; color: #4a5568; font-weight: 600;">Book Title</td>
                <td style="padding: 15px; border-bottom: 1px solid #e9ecef; color: #2d3748;">${request.requestedTitle}</td>
            </tr>
            <tr>
                <td style="padding: 15px; border-bottom: 1px solid #e9ecef; color: #4a5568; font-weight: 600;">Author</td>
                <td style="padding: 15px; border-bottom: 1px solid #e9ecef; color: #2d3748;">${request.requestedAuthor}</td>
            </tr>
            <tr>
                <td style="padding: 15px; color: #4a5568; font-weight: 600;">Current Status</td>
                <td style="padding: 15px; color: ${statusColors[request.status]}; font-weight: 600;">${request.status}</td>
            </tr>
        </table>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 25px;">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">
                You will receive further notifications if there are additional updates to your request.
            </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/my-requests" style="background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                View My Requests
            </a>
        </div>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: `Update: Your Book Request for "${request.requestedTitle}"`,
    html: getEmailTemplate(content, "Book Request Update"),
  });
};

/**
 * @function getOrderConfirmationEmail
 * @description Generates the email template sent to users after successfully placing an order.
 */
exports.sendOrderConfirmationToUser = async (toEmail, order) => {
  const itemsList = order.items
    .map(
      (i, index) => `
    <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; color: #4a5568;">${index + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; color: #2d3748;">${i.bookTitle}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; color: #4a5568; text-align: center;">${i.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; color: #2d3748; text-align: right;">$${i.price}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; color: #1a73e8; text-align: right;">$${(i.quantity * i.price).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const content = `
    <div>
        <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 25px; font-weight: 600; text-align: center;">Order Confirmation</h2>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
            <p style="margin: 0; color: #1a73e8; font-size: 18px; font-weight: 600;">
                Thank you for your order! We're preparing your items for shipment.
            </p>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Order Summary</h3>
            
            <table width="100%" style="border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #4a5568;">Order Number</td>
                    <td style="padding: 8px 0; color: #2d3748; text-align: right; font-weight: 600;">#${order._id}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568;">Order Date</td>
                    <td style="padding: 8px 0; color: #2d3748; text-align: right;">${new Date().toLocaleDateString()}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568;">Payment Method</td>
                    <td style="padding: 8px 0; color: #2d3748; text-align: right;">${order.paymentMethod}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568;">Order Status</td>
                    <td style="padding: 8px 0; color: #52c41a; text-align: right; font-weight: 600;">${order.status}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Total Amount</td>
                    <td style="padding: 8px 0; color: #1a73e8; text-align: right; font-weight: 600; font-size: 18px;">$${order.totalAmount}</td>
                </tr>
            </table>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Order Details</h3>
            
            <table width="100%" style="border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 12px; text-align: left; color: #4a5568; font-weight: 600;">#</th>
                        <th style="padding: 12px; text-align: left; color: #4a5568; font-weight: 600;">Item</th>
                        <th style="padding: 12px; text-align: center; color: #4a5568; font-weight: 600;">Qty</th>
                        <th style="padding: 12px; text-align: right; color: #4a5568; font-weight: 600;">Price</th>
                        <th style="padding: 12px; text-align: right; color: #4a5568; font-weight: 600;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsList}
                </tbody>
            </table>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/orders/${order._id}" style="background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; margin-right: 15px;">
                View Order Details
            </a>
            <a href="${process.env.FRONTEND_URL}/track-order" style="background: #ffffff; color: #1a73e8; padding: 12px 24px; text-decoration: none; border-radius: 6px; border: 1px solid #1a73e8; font-weight: 600; display: inline-block;">
                Track Order
            </a>
        </div>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: `Order Confirmation #${order._id}`,
    html: getEmailTemplate(content, "Order Confirmation"),
  });
};

/**
 * @function getNewOrderNotificationEmail
 * @description Generates the email template sent to sellers when a new order is placed in their store.
 */
exports.sendNewOrderNotificationToSeller = async (toEmail, order, user) => {
  const itemsList = order.items
    .map(
      (i, index) => `
    <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; color: #4a5568;">${index + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; color: #2d3748;">${i.bookTitle}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; color: #4a5568; text-align: center;">${i.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; color: #2d3748; text-align: right;">$${i.price}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; color: #1a73e8; text-align: right;">$${(i.quantity * i.price).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const content = `
    <div>
        <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 25px; font-weight: 600;">New Order Received</h2>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <p style="margin: 0; color: #1a73e8; font-weight: 600;">
                You have received a new order from ${user.userName}. Please process this order promptly.
            </p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
            <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px;">
                <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Order Information</h3>
                <p style="margin: 8px 0; color: #4a5568;"><strong>Order ID:</strong> #${order._id}</p>
                <p style="margin: 8px 0; color: #4a5568;"><strong>Total Amount:</strong> $${order.totalAmount}</p>
                <p style="margin: 8px 0; color: #4a5568;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                <p style="margin: 8px 0; color: #4a5568;"><strong>Order Status:</strong> ${order.status}</p>
            </div>
            
            <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px;">
                <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Customer Information</h3>
                <p style="margin: 8px 0; color: #4a5568;"><strong>Customer:</strong> ${user.userName}</p>
                <p style="margin: 8px 0; color: #4a5568;"><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
            </div>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Order Items</h3>
            
            <table width="100%" style="border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 12px; text-align: left; color: #4a5568; font-weight: 600;">#</th>
                        <th style="padding: 12px; text-align: left; color: #4a5568; font-weight: 600;">Item</th>
                        <th style="padding: 12px; text-align: center; color: #4a5568; font-weight: 600;">Qty</th>
                        <th style="padding: 12px; text-align: right; color: #4a5568; font-weight: 600;">Price</th>
                        <th style="padding: 12px; text-align: right; color: #4a5568; font-weight: 600;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsList}
                </tbody>
            </table>
        </div>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/seller/orders/${order._id}" style="background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Process Order
            </a>
        </div>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: `New Order #${order._id} from ${user.userName}`,
    html: getEmailTemplate(content, "New Order Notification"),
  });
};

/**
 * @function getOrderCancelledUserEmail
 * @description Generates the email template sent to users when their order is cancelled.
 */
exports.sendOrderCancelledToUser = async (toEmail, order) => {
  const itemsList = order.items
    .map(
      (i, index) => `
    <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; color: #4a5568;">${index + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; color: #2d3748;">${i.bookTitle}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; color: #4a5568; text-align: center;">${i.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; color: #2d3748; text-align: right;">$${i.price}</td>
    </tr>
  `
    )
    .join("");

  const content = `
    <div>
        <h2 style="color: #f5222d; font-size: 24px; margin-bottom: 25px; font-weight: 600; text-align: center;">Order Cancelled</h2>
        
        <div style="background: #fff1f0; padding: 20px; border-radius: 8px; border-left: 4px solid #f5222d; margin-bottom: 25px;">
            <p style="margin: 0; color: #f5222d; font-weight: 600;">
                Your order has been cancelled. If payment was processed, refund will be initiated according to our refund policy.
            </p>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #ffccc7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Cancelled Order Details</h3>
            
            <table width="100%" style="border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #4a5568;">Order Number</td>
                    <td style="padding: 8px 0; color: #2d3748; text-align: right; font-weight: 600;">#${order._id}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568;">Cancellation Date</td>
                    <td style="padding: 8px 0; color: #2d3748; text-align: right;">${new Date().toLocaleDateString()}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568;">Total Amount</td>
                    <td style="padding: 8px 0; color: #f5222d; text-align: right; font-weight: 600;">$${order.totalAmount}</td>
                </tr>
            </table>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #ffccc7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Cancelled Items</h3>
            
            <table width="100%" style="border-collapse: collapse;">
                <thead>
                    <tr style="background: #fff2e8;">
                        <th style="padding: 12px; text-align: left; color: #4a5568; font-weight: 600;">#</th>
                        <th style="padding: 12px; text-align: left; color: #4a5568; font-weight: 600;">Item</th>
                        <th style="padding: 12px; text-align: center; color: #4a5568; font-weight: 600;">Qty</th>
                        <th style="padding: 12px; text-align: right; color: #4a5568; font-weight: 600;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsList}
                </tbody>
            </table>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">
                If you have any questions about this cancellation or need assistance, please contact our support team.
            </p>
        </div>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/contact" style="background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Contact Support
            </a>
        </div>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: `Order Cancelled #${order._id}`,
    html: getEmailTemplate(content, "Order Cancellation"),
  });
};

/**
 * @function getOrderCancelledSellerEmail
 * @description Generates the email template sent to sellers when an order in their store is cancelled.
 */
exports.sendOrderCancelledToSeller = async (toEmail, order, user) => {
  const itemsList = order.items
    .map(
      (i, index) => `
    <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; color: #4a5568;">${index + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; color: #2d3748;">${i.bookTitle}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; color: #4a5568; text-align: center;">${i.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; color: #2d3748; text-align: right;">$${i.price}</td>
    </tr>
  `
    )
    .join("");

  const content = `
    <div>
        <h2 style="color: #fa8c16; font-size: 24px; margin-bottom: 25px; font-weight: 600;">Order Cancelled by Customer</h2>
        
        <div style="background: #fff7e6; padding: 20px; border-radius: 8px; border-left: 4px solid #fa8c16; margin-bottom: 25px;">
            <p style="margin: 0; color: #fa8c16; font-weight: 600;">
                Order #${order._id} has been cancelled by ${user.userName}. No further action is required.
            </p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
            <div style="background: #ffffff; border: 1px solid #ffe7ba; border-radius: 8px; padding: 20px;">
                <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Order Details</h3>
                <p style="margin: 8px 0; color: #4a5568;"><strong>Order ID:</strong> #${order._id}</p>
                <p style="margin: 8px 0; color: #4a5568;"><strong>Total Amount:</strong> $${order.totalAmount}</p>
                <p style="margin: 8px 0; color: #4a5568;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            </div>
            
            <div style="background: #ffffff; border: 1px solid #ffe7ba; border-radius: 8px; padding: 20px;">
                <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Customer Information</h3>
                <p style="margin: 8px 0; color: #4a5568;"><strong>Customer:</strong> ${user.userName}</p>
                <p style="margin: 8px 0; color: #4a5568;"><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
            </div>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #ffe7ba; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Cancelled Items</h3>
            
            <table width="100%" style="border-collapse: collapse;">
                <thead>
                    <tr style="background: #fff7e6;">
                        <th style="padding: 12px; text-align: left; color: #4a5568; font-weight: 600;">#</th>
                        <th style="padding: 12px; text-align: left; color: #4a5568; font-weight: 600;">Item</th>
                        <th style="padding: 12px; text-align: center; color: #4a5568; font-weight: 600;">Qty</th>
                        <th style="padding: 12px; text-align: right; color: #4a5568; font-weight: 600;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsList}
                </tbody>
            </table>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">
                This order has been automatically removed from your active orders list.
            </p>
        </div>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: `Order Cancelled #${order._id} by ${user.userName}`,
    html: getEmailTemplate(content, "Order Cancellation Notice"),
  });
};

/**
 * @function getOrderUpdateUserEmail
 * @description Generates the email template sent to users when the status of their order is updated.
 */
exports.sendOrderStatusUpdateToUser = async (toEmail, order) => {
  const statusColors = {
    PROCESSING: "#1890ff",
    SHIPPED: "#52c41a",
    DELIVERED: "#722ed1",
    CANCELLED: "#f5222d",
  };

  const statusIcons = {
    PROCESSING: "⏳",
    SHIPPED: "🚚",
    DELIVERED: "✅",
    CANCELLED: "❌",
  };

  const content = `
    <div>
        <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 25px; font-weight: 600; text-align: center;">Order Status Update</h2>
        
        <div style="background: ${statusColors[order.status]}15; padding: 20px; border-radius: 8px; border-left: 4px solid ${statusColors[order.status]}; margin-bottom: 25px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
                <span style="font-size: 32px;">${statusIcons[order.status]}</span>
                <div>
                    <h3 style="margin: 0; color: ${statusColors[order.status]}; font-weight: 600;">Order ${order.status}</h3>
                    <p style="margin: 5px 0 0 0; color: #4a5568;">Your order status has been updated</p>
                </div>
            </div>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Order Details</h3>
            
            <table width="100%" style="border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #4a5568;">Order Number</td>
                    <td style="padding: 8px 0; color: #2d3748; text-align: right; font-weight: 600;">#${order.orderId}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568;">New Status</td>
                    <td style="padding: 8px 0; color: ${statusColors[order.status]}; text-align: right; font-weight: 600;">${order.status}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568;">Total Amount</td>
                    <td style="padding: 8px 0; color: #1a73e8; text-align: right; font-weight: 600;">$${order.totalAmount}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568;">Update Date</td>
                    <td style="padding: 8px 0; color: #2d3748; text-align: right;">${new Date().toLocaleDateString()}</td>
                </tr>
            </table>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/orders/${order.orderId}" style="background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; margin-right: 15px;">
                View Order Details
            </a>
            <a href="${process.env.FRONTEND_URL}/track-order" style="background: #ffffff; color: #1a73e8; padding: 12px 24px; text-decoration: none; border-radius: 6px; border: 1px solid #1a73e8; font-weight: 600; display: inline-block;">
                Track Order
            </a>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 25px;">
            <p style="margin: 0; color: #6c757d; font-size: 14px; text-align: center;">
                Thank you for shopping with LIBRIS VAULT. We appreciate your business.
            </p>
        </div>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: `Order Update: ${order.status} - #${order.orderId}`,
    html: getEmailTemplate(content, "Order Status Update"),
  });
};

/**
 * @function sendComplaintNotificationEmails
 * @description Sends email notifications when a complaint is submitted - to the user/seller and super admin
 */
exports.sendComplaintNotificationEmails = async (
  complaintData,
  userEmail,
  userRole,
  userName
) => {
  const { reason, complaintId, createdAt } = complaintData;

  // Format date for display
  const complaintDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Email content for the user/seller who submitted the complaint (Confirmation)
  const userContent = `
    <div style="text-align: center;">
        <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 20px; font-weight: 600;">Complaint Submitted Successfully</h2>
        
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%); padding: 25px; border-radius: 12px; margin-bottom: 25px;">
            <p style="color: #1a73e8; font-size: 18px; margin: 0; font-weight: 500;">
                Thank you for bringing this matter to our attention. We've received your complaint and will review it promptly.
            </p>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: left;">
            <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Complaint Details</h3>
            
            <table width="100%" style="border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 120px;">Complaint ID</td>
                    <td style="padding: 8px 0; color: #2d3748;">#${complaintId}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Submitted By</td>
                    <td style="padding: 8px 0; color: #2d3748;">${userName} (${userRole})</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Date & Time</td>
                    <td style="padding: 8px 0; color: #2d3748;">${complaintDate}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; vertical-align: top;">Reason</td>
                    <td style="padding: 8px 0; color: #2d3748;">${reason}</td>
                </tr>
            </table>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">
            Our support team will review your complaint and get back to you within 24-48 hours. 
            You can check the status of your complaint in your dashboard.
            </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/complaints" style="background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                View My Complaints
            </a>
        </div>
    </div>
  `;

  // Email content for super admin (Notification)
  const adminContent = `
    <div>
        <h2 style="color: #d9363e; font-size: 24px; margin-bottom: 25px; font-weight: 600;">New Complaint Received</h2>
        
        <div style="background: #fff2f0; padding: 20px; border-radius: 8px; border-left: 4px solid #ff4d4f; margin-bottom: 25px;">
            <p style="margin: 0; color: #d9363e; font-weight: 600;">
                ⚠️ Attention Required: A new complaint has been submitted and requires review.
            </p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
            <div style="background: #ffffff; border: 1px solid #ffccc7; border-radius: 8px; padding: 20px;">
                <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Complaint Information</h3>
                <p style="margin: 8px 0; color: #4a5568;"><strong>Complaint ID:</strong> #${complaintId}</p>
                <p style="margin: 8px 0; color: #4a5568;"><strong>Submission Date:</strong> ${complaintDate}</p>
                <p style="margin: 8px 0; color: #4a5568;"><strong>Priority:</strong> <span style="color: #fa8c16; font-weight: 600;">Medium</span></p>
            </div>
            
            <div style="background: #ffffff; border: 1px solid #ffccc7; border-radius: 8px; padding: 20px;">
                <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">User Information</h3>
                <p style="margin: 8px 0; color: #4a5568;"><strong>Name:</strong> ${userName}</p>
                <p style="margin: 8px 0; color: #极速AI
Continue
#4a5568;"><strong>Role:</strong> ${userRole}</p>
                <p style="margin: 8px 0; color: #4a5568;"><strong>Email:</strong> ${userEmail}</p>
            </div>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #ffccc7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Complaint Details</h3>
            
            <div style="background: #fff2e8; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                <p style="margin: 0; color: #fa8c16; font-weight: 600;">Reason for Complaint:</p>
                <p style="margin: 10px 0 0 0; color: #4a5568; line-height: 1.6;">${reason}</p>
            </div>
        </div>
        
        <div style="background: #f6ffed; padding: 15px; border-radius: 8px; border: 1px solid #b7eb8f; margin-bottom: 25px;">
            <p style="margin: 0; color: #389e0d; font-weight: 600;">Action Required:</p>
            <p style="margin: 10px 0 0 0; color: #4a5568; font-size: 14px;">
                Please review this complaint in the admin dashboard and take appropriate action. 
                Contact the user if additional information is needed.
            </p>
        </div>
        
        <div style="text-align: center;">
            <a href="${process.env.ADMIN_URL || process.env.FRONTEND_URL}/complaints/${complaintId}" style="background: linear-gradient(135deg, #d9363e 0%, #a8071a 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Review Complaint
            </a>
        </div>
    </div>
  `;

  try {
    // Send confirmation email to the user/seller who submitted the complaint
    const userEmailSent = await sendEmail({
      to: userEmail,
      subject: `Complaint Submitted Successfully - #${complaintId}`,
      html: getEmailTemplate(userContent, "Complaint Confirmation"),
    });

    // Send notification email to super admin (hardcoded email)
    const adminEmailSent = await sendEmail({
      to: "librisvault@gmail.com", // Hardcoded super admin email
      subject: `🚨 New Complaint Received - #${complaintId} from ${userName}`,
      html: getEmailTemplate(adminContent, "New Complaint Alert"),
    });

    return {
      userEmailSent,
      adminEmailSent,
    };
  } catch (error) {
    console.error(
      "Error sending complaint notification emails:",
      error.message
    );
    return {
      userEmailSent: false,
      adminEmailSent: false,
      error: error.message,
    };
  }
};

/**
 * @function sendComplaintStatusUpdateEmail
 * @description Sends email notification when complaint status is updated
 */
exports.sendComplaintStatusUpdateEmail = async (
  complaintData,
  userEmail,
  userName
) => {
  const { complaintId, status, resolution, updatedAt } = complaintData;

  const statusColors = {
    OPENED: "#1890ff",
    IN_REVIEW: "#fa8c16",
    RESOLVED: "#52c41a",
    CLOSED: "#722ed1",
  };

  const statusIcons = {
    OPENED: "📩",
    IN_REVIEW: "🕵️‍♂️",
    RESOLVED: "✅",
    CLOSED: "🔒",
  };

  const updateDate = new Date(updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const content = `
    <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; color: #333;">

        <!-- Header -->
        <h2 style="text-align: center; color: #2d3748; font-size: 22px; font-weight: 700; margin-bottom: 15px;">
          Complaint Update Notification
        </h2>
        <p style="text-align: center; font-size: 16px; color: #4a5568;">
          Hello <strong>${userName}</strong>, we’ve updated the status of your complaint.
        </p>

        <!-- Status Block -->
        <div style="background: ${statusColors[status]}15; padding: 20px; border-radius: 10px; border-left: 6px solid ${statusColors[status]}; margin: 20px 0;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: ${statusColors[status]};">
              ${statusIcons[status]} Status: ${status.replace("_", " ")}
            </h3>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #4a5568;">
              Updated on <strong>${updateDate}</strong>
            </p>
        </div>

        <!-- Complaint Info -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 15px;">
              <strong>Complaint ID:</strong> #${complaintId}
            </p>
            ${
              resolution
                ? `
            <p style="margin: 10px 0 0 0; font-size: 15px;">
              <strong>Resolution Note:</strong><br>
              <span style="color: #4a5568;">${resolution}</span>
            </p>
            `
                : ""
            }
        </div>

        <!-- Call to Action -->
        <div style="text-align: center; margin-top: 25px;">
            <a href="${process.env.FRONTEND_URL}/complaints/${complaintId}" 
              style="background: #1a73e8; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              View Complaint Details
            </a>
        </div>

        <!-- Footer -->
        <div style="margin-top: 30px; font-size: 13px; color: #6c757d; text-align: center;">
            <p style="margin: 0;">Thank you for your patience while we work to resolve your issue.</p>
            <p style="margin: 5px 0 0 0;">- The Support Team</p>
        </div>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Complaint Status Update - #${complaintId}`,
    html: getEmailTemplate(content, "Complaint Status Update"),
  });
};
