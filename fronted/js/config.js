// js/config.js - Application Configuration

/**
 * API Configuration
 * Update BASE_URL to match your backend server
 */
export const API_CONFIG = {
  // Backend base URL (change to your actual backend IP)
  BASE_URL: import.meta?.env?.VITE_API_URL || 
            process?.env?.API_BASE_URL || 
            'http://10.251.83.27:8000',
  
  // API version prefix
  VERSION: '/api/v1',
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Endpoints (relative to BASE_URL + VERSION)
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
    },
    // Cameras
    CAMERAS: {
      LIST: '/cameras',
      DETAIL: (id) => `/cameras/${id}`,
      CREATE: '/cameras',
      UPDATE: (id) => `/cameras/${id}`,
      DELETE: (id) => `/cameras/${id}`,
    },
    // Video Streams
    STREAM: {
      LIVE: '/stream/live',
      PLAYBACK: '/stream/playback',
    },
    // AI & Events
    AI: {
      RISK_SCORE: (id) => `/risk/score/${id}`,
      EVENTS: '/events',
      EVENT_DETAIL: (id) => `/events/${id}`,
    },
    // User Management (Admin)
    USERS: {
      LIST: '/users',
      CREATE: '/users',
      UPDATE: (id) => `/users/${id}`,
      DELETE: (id) => `/users/${id}`,
      RESET_PASSWORD: (id) => `/users/${id}/reset-password`,
    },
    // System
    SYSTEM: {
      HEALTH: '/health',
      SETTINGS: '/settings',
      DASHBOARD_STATS: '/dashboard/stats',
    },
    // Notifications
    NOTIFICATIONS: {
      LIST: '/notifications',
      MARK_READ: (id) => `/notifications/${id}/read`,
    },
  },
};

/**
 * Role-Based Access Control
 * Defines which pages each role can access
 */
export const ROLE_PERMISSIONS = {
  admin: {
    pages: ['dashboard', 'live', 'playback', 'cameras', 'users', 'settings'],
    actions: ['create', 'read', 'update', 'delete'],
    cameraAccess: 'all', // Can view all cameras
  },
  officer: {
    pages: ['dashboard', 'live', 'playback'],
    actions: ['read'],
    cameraAccess: 'assigned', // Only assigned cameras
  },
  viewer: {
    pages: ['dashboard', 'live'],
    actions: ['read'],
    cameraAccess: 'assigned',
  },
};

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  APP_NAME: 'CCTV AI Security System',
  APP_VERSION: '2.0.0',
  
  // Refresh intervals (milliseconds)
  REFRESH: {
    DASHBOARD_STATS: 30000,    // 30 seconds
    LIVE_RISK_SCORE: 5000,     // 5 seconds
    NOTIFICATIONS: 60000,      // 1 minute
  },
  
  // Risk thresholds (must match backend)
  RISK_THRESHOLDS: {
    LOW: 0.3,
    MEDIUM: 0.6,
    HIGH: 0.8,
  },
  
  // Pagination defaults
  PAGINATION: {
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 200,
  },
};

/**
 * Demo credentials (fallback when backend is offline)
 */
export const DEMO_USERS = {
  'admin@cctv.com': {
    password: 'admin123',
    role: 'admin',
    name: 'Security Admin',
    id: 1,
  },
  'officer@cctv.com': {
    password: 'officer123',
    role: 'officer',
    name: 'Security Officer',
    id: 2,
  },
  'viewer@cctv.com': {
    password: 'viewer123',
    role: 'viewer',
    name: 'Viewer',
    id: 3,
  },
};

/**
 * Helper: Build full API URL from endpoint key
 */
export function buildApiUrl(endpointKey, ...params) {
  const { BASE_URL, VERSION, ENDPOINTS } = API_CONFIG;
  
  // Navigate nested endpoint object (e.g., 'CAMERAS.DETAIL')
  const keys = endpointKey.split('.');
  let endpoint = ENDPOINTS;
  for (const key of keys) {
    endpoint = endpoint[key];
  }
  
  // If endpoint is a function, call it with params
  if (typeof endpoint === 'function') {
    endpoint = endpoint(...params);
  }
  
  return `${BASE_URL}${VERSION}${endpoint}`;
}

/**
 * Helper: Check if user role has permission for a page
 */
export function canAccessPage(role, page) {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions?.pages?.includes(page) || false;
}

/**
 * Helper: Format risk score to label and color
 */
export function formatRiskScore(score) {
  const { RISK_THRESHOLDS } = UI_CONFIG;
  
  if (score >= RISK_THRESHOLDS.HIGH) {
    return { label: 'HIGH', color: 'var(--danger)', class: 'badge-danger' };
  } else if (score >= RISK_THRESHOLDS.MEDIUM) {
    return { label: 'MEDIUM', color: 'var(--warning)', class: 'badge-warning' };
  } else {
    return { label: 'LOW', color: 'var(--success)', class: 'badge-success' };
  }
}