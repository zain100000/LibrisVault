# 📚 LibrisVault Backend

A Node.js RESTful API for managing an online bookstore platform with multi-role access (Super Admin, Sellers, and Users). Built with scalability and security in mind to handle book inventory, orders, promotions, and user interactions.

## 🚀 Features

## Super Admin Module

- User & Seller Management (approvals, suspensions, performance dashboards)
- Book Catalog Management (centralized database, genre standardization)
- Order & Transaction Oversight (view all orders, track deliveries, generate reports)
- Analytics & Reporting (platform analytics, seller performance, revenue reporting)
- Promotions & Discounts (system-wide promotions, approval of seller promotions)
- Dispute & Complaint Management (handle complaints, track resolution history)

## Seller Module

- Inventory Management (add/update books, stock alerts, categorization)
- Order Management (process orders, update status, handle returns/refunds)
- Promotions & Discounts (set individual book discounts, track performance)
- Reporting & Analytics (sales reports, best-sellers, profit margins)
- Customer Engagement (respond to user queries)

## User Module

- Account Management (registration, profile editing, order history)
- Book Discovery (search by title/author/ISBN/genre, filters, detailed info)
- Shopping & Orders (cart, checkout, payment integration, delivery tracking)
- Reviews & Ratings (rate books, write reviews)
- Request Unavailable Books (notify sellers about desired books)

🛠️ Tech Stack

## Node.js - Runtime environment

## Express.js - Web framework

## MongoDB - Database

## JWT - Authentication

## dotenv - Environment variables

## Cloudinary - Image management

## Nodemailer - Email notifications

## Cron - Scheduled tasks

---

## 📁 Project Structure

libris-vault-backend/
├── controllers/ # Business logic for each route
│ ├── analytic-controllers/
│ ├── book-controllers/
│ ├── book-request-controllers/
│ ├── cart-controllers/
│ ├── complaint-controllers/
│ ├── order-controller/
│ ├── otp-controllers/
│ ├── promotion-controllers/
│ ├── rating-controllers/
│ ├── report-controllers/
│ ├── review-controllers/
│ ├── seller-analytics-controllers/
│ ├── seller-controllers/
│ ├── store-controllers/
│ ├── super-admin-controllers/
│ └── user-controllers/
├── helpers/ # Helper functions
│ ├── email-helper/
│ ├── password-helper/
│ ├── report-exporter-helper/
│ └── token-helper/
├── middlewares/ # Custom middlewares
│ ├── auth.middleware.js
│ └── security.middleware.js
├── models/ # Database models
│ ├── book-models/
│ ├── book-request-models/
│ ├── complaint-models/
│ ├── order.models/
│ ├── promotion-models/
│ ├── seller-models/
│ ├── store-models/
│ ├── super-admin-models/
│ └── user-models/
├── routes/ # Route definitions
│ ├── analytic-routes/
│ ├── book-request-routes/
│ ├── book-routes/
│ ├── cart-routes/
│ ├── complaint-routes/
│ ├── order-routes/
│ ├── otp-routes/
│ ├── promotion-routes/
│ ├── rating-routes/
│ ├── report-routes/
│ ├── review-routes/
│ ├── seller-analytic-routes/
│ ├── seller-routes/
│ ├── store-routes/
│ ├── super-admin-routes/
│ └── user-routes/
├── utilities/ # Utility functions
│ ├── cloudinary/
│ ├── cron/
│ ├── otp/
│ └── promotion/
├── .env # Environment variables
├── app.js # Application entry point
└── package.json # Dependencies and scripts

---

📬 Contact
For any questions, suggestions, or contributions:

## Name: Muhammad Zain-Ul-Abideen

## Email: muhammadzainulabideen292@gmail.com

## GitHub: https://github.com/zain100000

## LinkedIn: https://www.linkedin.com/in/muhammad-zain-ul-abideen-270581272/

---
