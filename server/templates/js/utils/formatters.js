// js/utils/formatters.js - Formatting Utilities

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} Formatted date string
 */
export function formatDate(date, locale = 'en-US') {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format time to readable string
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} Formatted time string
 */
export function formatTime(date, locale = 'en-US') {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format date and time together
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} Formatted datetime string
 */
export function formatDateTime(date, locale = 'en-US') {
  if (!date) return 'N/A';
  return `${formatDate(date, locale)} ${formatTime(date, locale)}`;
}

/**
 * Format relative time (e.g., "2 minutes ago")
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return 'N/A';
  
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(date);
}

/**
 * Format risk score to label, color, and class
 * @param {number} score - Risk score (0.0 to 1.0)
 * @returns {object} { label, color, class }
 */
export function formatRiskScore(score) {
  if (score >= 0.8) {
    return { label: 'CRITICAL', color: 'var(--danger)', class: 'badge-danger' };
  } else if (score >= 0.6) {
    return { label: 'HIGH', color: 'var(--danger)', class: 'badge-danger' };
  } else if (score >= 0.3) {
    return { label: 'MEDIUM', color: 'var(--warning)', class: 'badge-warning' };
  } else {
    return { label: 'LOW', color: 'var(--success)', class: 'badge-success' };
  }
}

/**
 * Format camera status to badge class
 * @param {string} status - Camera status
 * @returns {string} Badge class name
 */
export function formatCameraStatus(status) {
  const statusMap = {
    'online': 'badge-success',
    'offline': 'badge-danger',
    'maintenance': 'badge-warning',
  };
  return statusMap[status?.toLowerCase()] || 'badge-info';
}

/**
 * Format user role to display name
 * @param {string} role - User role
 * @returns {string} Formatted role name
 */
export function formatUserRole(role) {
  const roleMap = {
    'admin': '🔷 Administrator',
    'officer': '👮 Security Officer',
    'viewer': '👁️ Viewer',
  };
  return roleMap[role?.toLowerCase()] || role;
}

/**
 * Format file size to human-readable string
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size string
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format duration in seconds to HH:MM:SS
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const h = hrs > 0 ? `${hrs.toString().padStart(2, '0')}:` : '';
  const m = mins.toString().padStart(2, '0') + ':';
  const s = secs.toString().padStart(2, '0');
  
  return h + m + s;
}

/**
 * Format percentage with color class
 * @param {number} value - Percentage value (0-100)
 * @returns {object} { value, class }
 */
export function formatPercentage(value) {
  if (value >= 80) {
    return { value: `${value}%`, class: 'text-success' };
  } else if (value >= 50) {
    return { value: `${value}%`, class: 'text-warning' };
  } else {
    return { value: `${value}%`, class: 'text-danger' };
  }
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Format event type to readable label
 * @param {string} type - Event type (e.g., 'person_detected')
 * @returns {string} Formatted label
 */
export function formatEventType(type) {
  if (!type) return 'Event';
  return type.replace(/_/g, ' ').toUpperCase();
}