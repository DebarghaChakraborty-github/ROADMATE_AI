// utils/helpers.js

/**
 * Format date into a readable string format
 * @param {Date} date
 * @returns {string}
 */
const formatDate = (date = new Date()) => {
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Generate a unique Ride ID
 * @returns {string}
 */
const generateRideId = () => {
  const prefix = 'RIDE';
  const timestamp = Date.now().toString().slice(-6); // last 6 digits of timestamp
  const random = Math.floor(100 + Math.random() * 900); // random 3 digit number
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Check if required fields exist in the payload
 * @param {object} body
 * @param {string[]} fields
 * @returns {{ valid: boolean, missing: string[] }}
 */
const validateFields = (body, fields) => {
  const missing = fields.filter((field) => !body[field]);
  return {
    valid: missing.length === 0,
    missing,
  };
};

/**
 * Capitalize the first letter of each word
 * @param {string} str
 * @returns {string}
 */
const capitalizeWords = (str = '') => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Log a custom activity
 * @param {string} type
 * @param {string} message
 */
const logActivity = (type, message) => {
  const timestamp = formatDate();
  console.log(`[${type.toUpperCase()}] [${timestamp}]: ${message}`);
};

module.exports = {
  formatDate,
  generateRideId,
  validateFields,
  capitalizeWords,
  logActivity,
};
