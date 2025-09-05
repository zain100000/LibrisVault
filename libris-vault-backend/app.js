const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const { securityMiddleware } = require("./middlewares/security.middleware");

const app = express();

securityMiddleware(app);
app.use(cookieParser());
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));

const corsOptions = {
  origin:
    process.env.ALLOWED_ORIGINS === "*"
      ? true
      : process.env.ALLOWED_ORIGINS.split(","),
  credentials: true,
  optionsSuccessStatus: 201,
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    process.env.ALLOWED_ORIGINS || "*"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Content-Type-Options"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// ==================== BASE API ROUTES ====================
const superAdminRoute = require("./routes/super-admin-routes/super-admin.route.js");
const sellerRoute = require("./routes/seller-routes/seller.route.js");
const otpRoute = require("./routes/otp-routes/otp-route.js");
const inventoryRoute = require("./routes/book-routes/book.route.js");
const storeRoute = require("./routes/store-routes/store-route.js");
const promotionRoute = require("./routes/promotion-routes/promotion.route.js");
const userRoute = require("./routes/user-routes/user.route.js");
const cartRoute = require("./routes/cart-routes/cart-route.js");
const ratingRoute = require("./routes/rating-routes/rating-route.js");
const reviewRoute = require("./routes/review-routes/review.route.js");
const bookRequestRoute = require("./routes/book-request-routes/book.request.route.js");
const orderRoute = require("./routes/order-routes/order.route.js");
const complaintRoute = require("./routes/complaint-routes/complaint.route.js");
const reportRoute = require("./routes/report-routes/report.route.js");
const analyticRoute = require("./routes/analytic-routes/analytic.route.js");

// ==================== API MIDDLEWARES ====================
app.use("/api/super-admin", superAdminRoute);
app.use("/api/seller", sellerRoute);
app.use("/api/otp", otpRoute);
app.use("/api/inventory", inventoryRoute);
app.use("/api/store", storeRoute);
app.use("/api/promotion", promotionRoute);
app.use("/api/user", userRoute);
app.use("/api/cart", cartRoute);
app.use("/api/rating", ratingRoute);
app.use("/api/review", reviewRoute);
app.use("/api/request", bookRequestRoute);
app.use("/api/order", orderRoute);
app.use("/api/complaint", complaintRoute);
app.use("/api/report", reportRoute);
app.use("/api/analytic", analyticRoute);

// ==================== CRON JOBS ====================
require("./utilities/cron/cron.js");

// ==================== SERVER MIDDLEWARES ====================

app.get("/api/health", (req, res) => {
  res.status(201).json({
    success: true,
    message: "Server is running healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("Connected to MongoDB successfully!");
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully");
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully");
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed");
    process.exit(0);
  });
});

module.exports = app;
