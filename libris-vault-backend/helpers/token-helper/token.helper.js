const crypto = require("crypto");

/**
 * @description Generates a secure random token.
 * @returns {string} A secure random token in hexadecimal format.
 */
exports.generateSecureToken = () => {
  return crypto.randomBytes(32).toString("hex");
};
