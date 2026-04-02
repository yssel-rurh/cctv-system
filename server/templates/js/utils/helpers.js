// js/utils/helpers.js - General Helper Utilities

/**
 * Wait for DOM to be ready
 * @returns {Promise}
 */
export function waitForDOM() {
  return new Promise(resolve => {
    if (document.readyState !== 'loading') {
      resolve();
    } else {
      document.addEventListener('DOMContentLoaded', resolve);
    }
  });
}

/**
 * Wait for a condition to be true
 * @param {Function} condition - Condition function
 * @param {number} timeout - Timeout in ms
 * @returns {Promise}
 */
export function waitForCondition(condition, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, 100);
      }
    };
    
    check();
  });
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Create element with attributes
 * @param {string} tag - HTML tag name
 * @param {object} attributes - Attributes object
 * @param {string|HTMLElement} content - Inner content
 * @returns {HTMLElement}
 */
export function createElement(tag, attributes = {}, content = '') {
  const el = document.createElement(tag);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([k, v]) => {
        el.dataset[k] = v;
      });
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.substring(2).toLowerCase(), value);
    } else {
      el.setAttribute(key, value);
    }
  });
  
  if (typeof content === 'string') {
    el.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    el.appendChild(content);
  }
  
  return el;
}

/**
 * Find element by selector with timeout
 * @param {string} selector - CSS selector
 * @param {number} timeout - Timeout in ms
 * @returns {Promise<HTMLElement>}
 */
export async function findElement(selector, timeout = 5000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const el = document.querySelector(selector);
    if (el) return el;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  throw new Error(`Element not found: ${selector}`);
}

/**
 * Toggle element visibility
 * @param {HTMLElement} el - Element to toggle
 * @param {boolean} show - Force show/hide
 */
export function toggleElement(el, show = null) {
  if (show === null) {
    el.classList.toggle('hidden');
  } else if (show) {
    el.classList.remove('hidden');
  } else {
    el.classList.add('hidden');
  }
}

/**
 * Show element with animation
 * @param {HTMLElement} el - Element to show
 * @param {string} animation - Animation class
 */
export function showElement(el, animation = 'fadeIn') {
  el.classList.remove('hidden');
  el.classList.add(animation);
  setTimeout(() => el.classList.remove(animation), 300);
}

/**
 * Hide element with animation
 * @param {HTMLElement} el - Element to hide
 * @param {string} animation - Animation class
 */
export function hideElement(el, animation = 'fadeOut') {
  el.classList.add(animation);
  setTimeout(() => {
    el.classList.add('hidden');
    el.classList.remove(animation);
  }, 300);
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Download file from URL
 * @param {string} url - File URL
 * @param {string} filename - Download filename
 */
export function downloadFile(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Generate unique ID
 * @returns {string}
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parse query parameters from URL
 * @param {string} url - URL string
 * @returns {object}
 */
export function parseQueryParams(url = window.location.href) {
  const params = {};
  const queryString = url.split('?')[1];
  
  if (!queryString) return params;
  
  queryString.split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    params[decodeURIComponent(key)] = decodeURIComponent(value || '');
  });
  
  return params;
}

/**
 * Build query string from object
 * @param {object} params - Parameters object
 * @returns {string}
 */
export function buildQueryString(params) {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

/**
 * Local storage wrapper with JSON serialization
 */
export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  
  remove(key) {
    localStorage.removeItem(key);
  },
  
  clear() {
    localStorage.clear();
  }
};

/**
 * Event delegation helper
 * @param {HTMLElement} parent - Parent element
 * @param {string} selector - Child selector
 * @param {string} eventType - Event type
 * @param {Function} handler - Event handler
 */
export function delegateEvent(parent, selector, eventType, handler) {
  parent.addEventListener(eventType, (e) => {
    const target = e.target.closest(selector);
    if (parent.contains(target)) {
      handler.call(target, e, target);
    }
  });
}

/**
 * Format API error message
 * @param {Error|object} error - Error object
 * @returns {string}
 */
export function formatErrorMessage(error) {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.errors?.[0]?.message) return error.errors[0].message;
  return 'An unexpected error occurred';
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum retries
 * @param {number} delay - Initial delay in ms
 * @returns {Promise}
 */
export async function retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const waitTime = delay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} el - Element to check
 * @returns {boolean}
 */
export function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Smooth scroll to element
 * @param {HTMLElement} el - Element to scroll to
 * @param {object} options - Scroll options
 */
export function scrollToElement(el, options = { behavior: 'smooth' }) {
  el?.scrollIntoView(options);
}