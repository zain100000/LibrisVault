/**
 * Validation Utilities
 *
 * Provides reusable validation functions for authentication,
 * product management, and general form handling.
 *
 * Features:
 * - Field-level validators (e.g., email, password, full name, etc.)
 * - Unified validation function to check multiple fields at once
 * - Utility to determine overall form validity
 */

/**
 * Validate full name.
 * @param {string} fullName - The user's full name.
 * @returns {string} Error message or empty string if valid.
 */
export const validateFullName = (fullName) => {
  if (!fullName) {
    return "Full Name is required";
  }
  if (fullName.length < 3) {
    return "Full Name must be at least 3 characters long";
  }
  return "";
};

/**
 * Validate email format.
 * @param {string} email - The user's email address.
 * @returns {string} Error message or empty string if valid.
 */
export const validateEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return "Email is required";
  }
  if (!emailPattern.test(email)) {
    return "Please enter a valid email address";
  }
  return "";
};

/**
 * Validate password strength.
 * @param {string} password - The user's password.
 * @returns {string} Error message or empty string if valid.
 */
export const validatePassword = (password) => {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 4) {
    return "Password must be at least 4 characters long";
  }
  return "";
};

/**
 * Validate contact number (must be 11 digits).
 * @param {string} contactNumber - The user's contact number.
 * @returns {string} Error message or empty string if valid.
 */
export const validateContactNumber = (contactNumber) => {
  const contactNumberPattern = /^[0-9]{11}$/;
  if (!contactNumber) {
    return "Contact number is required";
  }
  if (!contactNumberPattern.test(contactNumber)) {
    return "Contact number must be 11 digits";
  }
  return "";
};

/**
 * Validate product title.
 * @param {string} title - The product title.
 * @returns {string} Error message or empty string if valid.
 */
export const validateTitle = (title) => {
  if (!title) {
    return "Title is required";
  }
  if (title.length < 5) {
    return "Title must be at least 5 characters long";
  }
  return "";
};

/**
 * Validate product description.
 * @param {string} description - The product description.
 * @returns {string} Error message or empty string if valid.
 */
export const validateDescription = (description) => {
  if (!description) {
    return "Description is required";
  }
  if (description.length < 15) {
    return "Description must be at least 15 characters long";
  }
  return "";
};

/**
 * Validate product price.
 * @param {string|number} price - The product price.
 * @returns {string} Error message or empty string if valid.
 */
export const validatePrice = (price) => {
  if (!price) {
    return "Price is required";
  }
  return "";
};

/**
 * Validate product category.
 * @param {string} category - The product category.
 * @returns {string} Error message or empty string if valid.
 */
export const validateCategory = (category) => {
  if (!category) {
    return "Category is required";
  }
  return "";
};

/**
 * Validate multiple fields at once using the appropriate validation function.
 *
 * @param {Object} fields - Object containing field names and values.
 * @returns {Object} Errors keyed by field name.
 */
export const validateFields = (fields) => {
  const validationFunctions = {
    fullName: validateFullName,
    email: validateEmail,
    password: validatePassword,
    contactNumber: validateContactNumber,
    title: validateTitle,
    description: validateDescription,
    price: validatePrice,
    category: validateCategory,
  };

  const errors = {};

  Object.keys(fields).forEach((field) => {
    if (validationFunctions[field]) {
      const error = validationFunctions[field](fields[field]);
      if (error) {
        errors[field] = error;
      }
    }
  });

  return errors;
};

/**
 * Determine if all inputs in a form are valid.
 *
 * @param {Object} fields - Object containing field names and values.
 * @returns {boolean} True if all fields are valid, false otherwise.
 */
export const isValidInput = (fields) => {
  console.log("Validating fields: ", fields);
  const errors = validateFields(fields);
  console.log("Validation errors: ", errors);
  return Object.values(errors).every((error) => error === "");
};
