// js/state.js - Global State Management

/**
 * Application State Class
 * Manages global state with simple reactivity pattern
 */
class AppState {
  constructor() {
    this.state = {
      // Auth
      authenticated: false,
      user: null,
      
      // Data
      cameras: [],
      events: [],
      users: [],
      stats: null,
      settings: null,
      notifications: [],
      
      // UI
      loading: false,
      error: null,
      currentPage: 'dashboard',
      selectedCamera: null,
      
      // Backend status
      backendOnline: true,
      demoMode: false,
    };
    
    // Subscribers for reactive updates
    this.subscribers = new Map();
  }

  /**
   * Get state value (supports dot notation: 'user.role')
   */
  get(key) {
    return key.split('.').reduce((obj, k) => obj?.[k], this.state);
  }

  /**
   * Set state value and notify subscribers
   */
  set(key, value) {
    const keys = key.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, k) => obj[k], this.state);
    
    if (target) {
      const oldValue = target[lastKey];
      target[lastKey] = value;
      
      // Notify subscribers for this key
      this.notify(key, value, oldValue);
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.get(key)?.delete(callback);
    };
  }

  /**
   * Notify subscribers of state change
   */
  notify(key, newValue, oldValue) {
    this.subscribers.get(key)?.forEach(callback => {
      try {
        callback(newValue, oldValue);
      } catch (error) {
        console.error('State subscriber error:', error);
      }
    });
  }

  // ==================== CONVENIENCE METHODS ====================

  setAuthenticated(value) {
    this.set('authenticated', value);
  }

  setUser(user) {
    this.set('user', user);
  }

  setCameras(cameras) {
    this.set('cameras', cameras);
  }

  setEvents(events) {
    this.set('events', events);
  }

  setStats(stats) {
    this.set('stats', stats);
  }

  setLoading(value) {
    this.set('loading', value);
  }

  setError(error) {
    this.set('error', error);
  }

  setCurrentPage(page) {
    this.set('currentPage', page);
  }

  setSelectedCamera(camera) {
    this.set('selectedCamera', camera);
  }

  setBackendOnline(value) {
    this.set('backendOnline', value);
  }

  setDemoMode(value) {
    this.set('demoMode', value);
  }

  /**
   * Clear all data (on logout)
   */
  clear() {
    this.state.cameras = [];
    this.state.events = [];
    this.state.users = [];
    this.state.stats = null;
    this.state.settings = null;
    this.state.notifications = [];
    this.state.selectedCamera = null;
    this.state.error = null;
  }

  /**
   * Get full state snapshot
   */
  getState() {
    return { ...this.state };
  }
}

// Export singleton instance
export const state = new AppState();