const bcrypt = require("bcrypt");

/**
 * @description Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.
 * @type {RegExp}
 */
exports.passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * @description Hashes a password using bcrypt.
 * @param {string} password - The password to hash.
 */
exports.hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};
