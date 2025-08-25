const helmet = require("helmet");
const cors = require("cors");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

/**
 * @description Security middleware to enhance the security of the application
 * @param {Object} app - The Express application instance
 */
exports.securityMiddleware = (app) => {
  // Helmet for headers security
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS
  app.use(
    cors({
      origin:
        process.env.ALLOWED_ORIGINS === "*"
          ? true // allow all origins in dev
          : process.env.ALLOWED_ORIGINS.split(","),
      credentials: true,
    })
  );

  // Prevent HTTP parameter pollution
  app.use(hpp());

  // Sanitize Mongo queries safely for Express 5
  app.use(
    mongoSanitize({
      onSanitize: ({ key }) => {
        console.warn(`Sanitized key: ${key}`);
      },
      replaceWith: "_",
    })
  );

  // Prevent XSS attacks
  app.use(xss());
};
