// validator.js - Input sanitization, validation, and security constraints
const path = require('node:path');

// Sanitise plain text strings
function sanitizeText(str, maxLength = 500) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // strip HTML tag brackets
}

// Validate phone number (accepts Indian & international formats: 10-15 digits with optional +, spaces, hyphens)
function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

// Validate email (if provided)
function isValidEmail(email) {
  if (!email) return true; // Optional field
  if (typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim()) && email.length <= 100;
}

// Generate unique human-readable enquiry reference code: PCM-YYYY-XXXX
function generateReferenceCode() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const randomChars = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `PCM-${year}-${randomSuffix}${randomChars}`;
}

// Allowed prescription file extensions and mime types
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png']);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function validatePrescriptionUpload(filename, bufferLength) {
  if (!filename) {
    return { valid: false, error: 'Filename is required' };
  }
  const ext = path.extname(filename).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: 'Invalid file format. Only PDF, JPG, JPEG, and PNG files are accepted.'
    };
  }
  if (bufferLength > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'Prescription document exceeds the maximum allowed size of 5 MB.'
    };
  }
  return { valid: true };
}

// Validate enquiry input payload
function validateEnquiryPayload(body) {
  const errors = [];

  if (!body.customerName || sanitizeText(body.customerName).length < 2) {
    errors.push('Customer full name is required (minimum 2 characters).');
  }

  if (!isValidPhone(body.customerPhone)) {
    errors.push('A valid contact phone number (10-15 digits) is required.');
  }

  if (body.customerEmail && !isValidEmail(body.customerEmail)) {
    errors.push('Please provide a valid email address.');
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.push('At least one medicine must be selected for enquiry.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  sanitizeText,
  isValidPhone,
  isValidEmail,
  generateReferenceCode,
  validatePrescriptionUpload,
  validateEnquiryPayload
};
