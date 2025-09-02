const jwt = require("jsonwebtoken");
const SuperAdmin = require("../models/super-admin-models/super-admin.model");
const Seller = require("../models/seller-models/seller-model");
const User = require("../models/user-models/user.model");
const { rateLimit } = require("express-rate-limit");
const crypto = require("crypto");

/**
 * @description Environment variables for Libris Vault Backend
 * Ensure JWT_SECRET is set in your environment variables for security.
 */
if (!process.env.JWT_SECRET) {
  const generatedSecret = crypto.randomBytes(64).toString("hex");
  process.env.JWT_SECRET = generatedSecret;
}

/**
 * @desc auth limiter to prevent brute force attacks
 * @description Limits the number of authentication attempts to 3 per 15 minutes
 */
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @description Enhanced middleware to authenticate and authorize users with security improvements
 */
exports.authMiddleware = async (req, res, next) => {
  try {
    let jwtToken = null;
    const authHeader = req.header("Authorization");

    if (authHeader?.startsWith("Bearer ")) {
      jwtToken = authHeader.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      jwtToken = req.cookies.accessToken;
    }

    if (!jwtToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access, Token is missing",
      });
    }

    const decodedToken = jwt.verify(jwtToken, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      clockTolerance: 30,
    });

    if (
      !decodedToken?.user?.id ||
      !decodedToken?.role ||
      !decodedToken?.iat ||
      !decodedToken?.exp
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid Token Structure",
      });
    }

    if (decodedToken.exp < Date.now() / 1000) {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }

    const maxTokenAge = 24 * 60 * 60;
    if (decodedToken.iat < Date.now() / 1000 - maxTokenAge) {
      return res.status(401).json({
        success: false,
        message: "Token is too old",
      });
    }

    let userModel;
    switch (decodedToken.role) {
      case "SUPERADMIN":
        userModel = SuperAdmin;
        break;

      case "SELLER":
        userModel = Seller;
        break;

      case "USER":
        userModel = User;
        break;

      default:
        return res.status(401).json({
          success: false,
          message: "Invalid user role",
        });
    }

    const user = await userModel
      .findById(decodedToken.user.id)
      .select("-password -refreshToken -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    req.user = {
      id: user._id.toString(),
      role: decodedToken.role,
      email: user.email,
      sessionId: decodedToken.sessionId || null,
    };

    req.userId = user._id.toString();

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    console.error("Authentication Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};
