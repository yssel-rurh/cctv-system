// js/api.js - API Client with Fetch Wrapper

import { API_CONFIG, DEMO_USERS } from './config.js';

/**
 * API Client Class
 * Handles all HTTP requests to the backend with auth, error handling, and fallback
 */
export class APIClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL + API_CONFIG.VERSION;
    this.timeout = API_CONFIG.TIMEOUT;
    this.token = localStorage.getItem('token') || null;
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  /**
   * Internal fetch with auth headers, timeout, and error handling
   */
  async _request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    if (this.token) {
      config.headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse JSON or return empty object
      const data = await response.json().catch(() => null);
      return data || {};
      
    } catch (error) {
      // Handle network errors, timeouts, etc.
      console.error('API Request Failed:', error.message);
      
      // Return null for graceful fallback
      return null;
    }
  }

  // ==================== AUTHENTICATION ====================

  /**
   * POST /auth/login - Authenticate user
   */
  async login(email, password) {
    try {
      const result = await this._request(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (result?.access_token) {
        this.setToken(result.access_token);
        // Store user data (merge with demo fallback structure)
        const user = result.user || { email, role: 'officer', name: email.split('@')[0] };
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return result;
    } catch (error) {
      console.warn('Backend login failed, trying demo mode');
      return null;
    }
  }

  /**
   * POST /auth/logout - End session
   */
  async logout() {
    await this._request(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, { method: 'POST' });
    this.clearToken();
    localStorage.removeItem('user');
  }

  /**
   * GET /auth/me - Get current user info
   */
  async getCurrentUser() {
    return await this._request(API_CONFIG.ENDPOINTS.AUTH.ME);
  }

  // ==================== CAMERAS ====================

  /**
   * GET /cameras - List all cameras
   */
  async getCameras(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `${API_CONFIG.ENDPOINTS.CAMERAS.LIST}?${queryString}`
      : API_CONFIG.ENDPOINTS.CAMERAS.LIST;
    
    const result = await this._request(endpoint);
    return result?.cameras || [];
  }

  /**
   * GET /cameras/{id} - Get single camera
   */
  async getCamera(id) {
    return await this._request(API_CONFIG.ENDPOINTS.CAMERAS.DETAIL(id));
  }

  /**
   * POST /cameras - Create new camera (Admin)
   */
  async createCamera(data) {
    return await this._request(API_CONFIG.ENDPOINTS.CAMERAS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT /cameras/{id} - Update camera (Admin)
   */
  async updateCamera(id, data) {
    return await this._request(API_CONFIG.ENDPOINTS.CAMERAS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE /cameras/{id} - Delete camera (Admin)
   */
  async deleteCamera(id) {
    return await this._request(API_CONFIG.ENDPOINTS.CAMERAS.DELETE(id), {
      method: 'DELETE',
    });
  }

  // ==================== VIDEO STREAMS ====================

  /**
   * Get live stream URL for embedding
   */
  getLiveStreamUrl(cameraId) {
    return `${this.baseURL}${API_CONFIG.ENDPOINTS.STREAM.LIVE}?camera_id=${cameraId}`;
  }

  /**
   * Get playback stream URL
   */
  getPlaybackUrl(cameraId, startTime, endTime) {
    const params = new URLSearchParams({
      camera_id: cameraId,
      start: startTime,
      end: endTime,
    });
    return `${this.baseURL}${API_CONFIG.ENDPOINTS.STREAM.PLAYBACK}?${params}`;
  }

  // ==================== AI & EVENTS ====================

  /**
   * GET /risk/score/{id} - Get current risk score
   */
  async getRiskScore(cameraId) {
    return await this._request(API_CONFIG.ENDPOINTS.AI.RISK_SCORE(cameraId));
  }

  /**
   * GET /events - List AI-detected events
   */
  async getEvents(params = {}) {
    const defaultParams = { limit: UI_CONFIG.PAGINATION.DEFAULT_LIMIT, ...params };
    const queryString = new URLSearchParams(defaultParams).toString();
    const endpoint = `${API_CONFIG.ENDPOINTS.AI.EVENTS}?${queryString}`;
    
    const result = await this._request(endpoint);
    return result?.events || [];
  }

  /**
   * GET /events/{id} - Get single event details
   */
  async getEvent(id) {
    return await this._request(API_CONFIG.ENDPOINTS.AI.EVENT_DETAIL(id));
  }

  // ==================== USER MANAGEMENT (Admin) ====================

  /**
   * GET /users - List all users
   */
  async getUsers() {
    const result = await this._request(API_CONFIG.ENDPOINTS.USERS.LIST);
    return result?.users || [];
  }

  /**
   * POST /users - Create new user
   */
  async createUser(data) {
    return await this._request(API_CONFIG.ENDPOINTS.USERS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT /users/{id} - Update user
   */
  async updateUser(id, data) {
    return await this._request(API_CONFIG.ENDPOINTS.USERS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE /users/{id} - Delete user
   */
  async deleteUser(id) {
    return await this._request(API_CONFIG.ENDPOINTS.USERS.DELETE(id), {
      method: 'DELETE',
    });
  }

  // ==================== SYSTEM ====================

  /**
   * GET /health - Check backend status
   */
  async healthCheck() {
    const result = await this._request(API_CONFIG.ENDPOINTS.SYSTEM.HEALTH);
    return result?.status === 'healthy';
  }

  /**
   * GET /settings - Get system configuration
   */
  async getSettings() {
    return await this._request(API_CONFIG.ENDPOINTS.SYSTEM.SETTINGS);
  }

  /**
   * PUT /settings - Update system configuration
   */
  async updateSettings(data) {
    return await this._request(API_CONFIG.ENDPOINTS.SYSTEM.SETTINGS, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * GET /dashboard/stats - Get overview statistics
   */
  async getDashboardStats() {
    return await this._request(API_CONFIG.ENDPOINTS.SYSTEM.DASHBOARD_STATS);
  }

  // ==================== NOTIFICATIONS ====================

  /**
   * GET /notifications - List user notifications
   */
  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `${API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST}?${queryString}`;
    
    const result = await this._request(endpoint);
    return result?.notifications || [];
  }

  /**
   * PUT /notifications/{id}/read - Mark notification as read
   */
  async markNotificationRead(id) {
    return await this._request(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ(id), {
      method: 'PUT',
    });
  }

  // ==================== DEMO FALLBACK ====================

  /**
   * Demo mode: Return mock data when backend is offline
   */
  getDemoData(type, params = {}) {
    const demo = {
      cameras: [
        { id: 1, name: 'Entrance Main', location: 'Front Door', status: 'online', ip: '192.168.1.101' },
        { id: 2, name: 'Parking Lot A', location: 'North Parking', status: 'online', ip: '192.168.1.102' },
        { id: 3, name: 'Warehouse Entry', location: 'Loading Dock', status: 'offline', ip: '192.168.1.103' },
        { id: 4, name: 'Office Hallway', location: '2nd Floor', status: 'online', ip: '192.168.1.104' },
      ],
      events: [
        { id: 101, camera_id: 1, event_type: 'person_detected', risk_level: 'high', risk_score: 0.85, description: 'Person in restricted area', timestamp: new Date().toISOString() },
        { id: 102, camera_id: 2, event_type: 'motion_detected', risk_level: 'low', risk_score: 0.25, description: 'Motion detected', timestamp: new Date().toISOString() },
      ],
      stats: {
        total_cameras: 8,
        online_cameras: 6,
        active_alerts: 3,
        storage_used_percent: 78,
        system_health: 'healthy',
      },
      users: [
        { id: 1, email: 'admin@cctv.com', name: 'Security Admin', role: 'admin', status: 'active' },
        { id: 2, email: 'officer@cctv.com', name: 'Security Officer', role: 'officer', status: 'active' },
      ],
    };
    
    return demo[type] || [];
  }
}

// Export singleton instance
export const api = new APIClient();

// Export demo helper for fallback
export function getDemoData(type, params) {
  return api.getDemoData(type, params);
}