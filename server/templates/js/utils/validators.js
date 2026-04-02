// js/utils/validators.js - Input Validation Utilities

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {object} { valid: boolean, message: string }
 */
export function validateEmail(email) {
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email format' };
  }
  
  return { valid: true, message: '' };
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {object} options - Validation options
 * @returns {object} { valid: boolean, message: string, strength: string }
 */
export function validatePassword(password, options = {}) {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecial = false
  } = options;
  
  if (!password) {
    return { valid: false, message: 'Password is required', strength: 'none' };
  }
  
  if (password.length < minLength) {
    return { valid: false, message: `Password must be at least ${minLength} characters`, strength: 'weak' };
  }
  
  let strength = 'weak';
  let score = 0;
  
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain uppercase letter', strength };
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain lowercase letter', strength };
  }
  
  if (requireNumber && !/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain number', strength };
  }
  
  if (requireSpecial && !/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain special character', strength };
  }
  
  return { valid: true, message: '', strength };
}

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {object} { valid: boolean, message: string }
 */
export function validateRequired(value, fieldName = 'Field') {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true, message: '' };
}

/**
 * Validate string length
 * @param {string} value - String to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {object} { valid: boolean, message: string }
 */
export function validateLength(value, min, max) {
  if (!value) {
    return { valid: false, message: 'Value is required' };
  }
  
  const length = value.length;
  if (length < min) {
    return { valid: false, message: `Must be at least ${min} characters` };
  }
  if (length > max) {
    return { valid: false, message: `Must be no more than ${max} characters` };
  }
  
  return { valid: true, message: '' };
}

/**
 * Validate number range
 * @param {number} value - Number to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {object} { valid: boolean, message: string }
 */
export function validateNumberRange(value, min, max) {
  const num = Number(value);
  
  if (isNaN(num)) {
    return { valid: false, message: 'Must be a valid number' };
  }
  
  if (num < min) {
    return { valid: false, message: `Must be at least ${min}` };
  }
  if (num > max) {
    return { valid: false, message: `Must be no more than ${max}` };
  }
  
  return { valid: true, message: '' };
}

/**
 * Validate IP address format
 * @param {string} ip - IP address to validate
 * @returns {object} { valid: boolean, message: string }
 */
export function validateIPAddress(ip) {
  if (!ip) {
    return { valid: false, message: 'IP address is required' };
  }
  
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) {
    return { valid: false, message: 'Invalid IP address format' };
  }
  
  // Check each octet is 0-255
  const octets = ip.split('.');
  for (const octet of octets) {
    const num = parseInt(octet, 10);
    if (num < 0 || num > 255) {
      return { valid: false, message: 'IP address octets must be 0-255' };
    }
  }
  
  return { valid: true, message: '' };
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {object} { valid: boolean, message: string }
 */
export function validateURL(url) {
  if (!url) {
    return { valid: false, message: 'URL is required' };
  }
  
  try {
    new URL(url);
    return { valid: true, message: '' };
  } catch {
    return { valid: false, message: 'Invalid URL format' };
  }
}

/**
 * Validate phone number (flexible format)
 * @param {string} phone - Phone number to validate
 * @returns {object} { valid: boolean, message: string }
 */
export function validatePhone(phone) {
  if (!phone) {
    return { valid: false, message: 'Phone number is required' };
  }
  
  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check if it's mostly digits with optional + at start
  const phoneRegex = /^\+?\d{7,15}$/;
  if (!phoneRegex.test(cleaned)) {
    return { valid: false, message: 'Invalid phone number format' };
  }
  
  return { valid: true, message: '' };
}

/**
 * Validate camera configuration object
 * @param {object} camera - Camera data object
 * @returns {object} { valid: boolean, errors: object }
 */
export function validateCameraData(camera) {
  const errors = {};
  
  const name = validateRequired(camera.name, 'Camera name');
  if (!name.valid) errors.name = name.message;
  
  const location = validateRequired(camera.location, 'Location');
  if (!location.valid) errors.location = location.message;
  
  if (camera.ip_address) {
    const ip = validateIPAddress(camera.ip_address);
    if (!ip.valid) errors.ip_address = ip.message;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate user configuration object
 * @param {object} user - User data object
 * @returns {object} { valid: boolean, errors: object }
 */
export function validateUserData(user) {
  const errors = {};
  
  const name = validateRequired(user.name, 'Name');
  if (!name.valid) errors.name = name.message;
  
  const email = validateEmail(user.email);
  if (!email.valid) errors.email = email.message;
  
  if (user.password) {
    const password = validatePassword(user.password);
    if (!password.valid) errors.password = password.message;
  }
  
  if (!user.role || !['admin', 'officer', 'viewer'].includes(user.role)) {
    errors.role = 'Invalid role';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Show validation errors in form
 * @param {HTMLFormElement} form - Form element
 * @param {object} errors - Error object { fieldName: message }
 */
export function showFormErrors(form, errors) {
  // Clear previous errors
  form.querySelectorAll('.error-message').forEach(el => el.remove());
  form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  
  // Add new errors
  Object.entries(errors).forEach(([field, message]) => {
    const input = form.querySelector(`[name="${field}"]`);
    if (input) {
      input.classList.add('input-error');
      const errorEl = document.createElement('div');
      errorEl.className = 'error-message';
      errorEl.style.color = 'var(--danger)';
      errorEl.style.fontSize = 'var(--font-size-xs)';
      errorEl.style.marginTop = '4px';
      errorEl.textContent = message;
      input.parentNode.appendChild(errorEl);
    }
  });
}