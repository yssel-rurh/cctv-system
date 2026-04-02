// js/router.js - Client-Side Hash Routing

import { state } from './state.js';
import { isAuthenticated, canAccessPage, getCurrentUser, logout } from './auth.js';
import { api, getDemoData } from './api.js';
import { renderSidebar } from './components/sidebar.js';
import { renderNavbar } from './components/navbar.js';

// Import page renderers
import { renderDashboard } from './pages/dashboard.js';
import { renderLiveFeed } from './pages/live-feed.js';
import { renderPlayback } from './pages/playback.js';
import { renderCameras } from './pages/cameras.js';
import { renderUsers } from './pages/users.js';
import { renderSettings } from './pages/settings.js';

/**
 * Page components mapping
 */
const PAGES = {
  dashboard: renderDashboard,
  live: renderLiveFeed,
  playback: renderPlayback,
  cameras: renderCameras,
  users: renderUsers,
  settings: renderSettings,
};

/**
 * Get current page from URL hash
 */
function getCurrentPage() {
  const hash = window.location.hash.slice(1) || 'dashboard';
  return hash.split('?')[0]; // Remove query params
}

/**
 * Navigate to a page
 */
export function navigate(page, params = {}) {
  const queryString = Object.keys(params).length 
    ? '?' + new URLSearchParams(params).toString()
    : '';
  
  window.location.hash = `${page}${queryString}`;
}

/**
 * Check access and redirect if unauthorized
 */
function checkAccess(page) {
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return false;
  }
  
  if (!canAccessPage(page)) {
    // Redirect to dashboard if not authorized
    navigate('dashboard');
    return false;
  }
  
  return true;
}

/**
 * Render the current page
 */
async function renderPage() {
  const page = getCurrentPage();
  const pageContent = document.getElementById('page-content');
  
  if (!pageContent) {
    console.error('Page content container not found');
    return;
  }
  
  // Check access
  if (!checkAccess(page)) {
    return;
  }
  
  // Update state
  state.setCurrentPage(page);
  state.setLoading(true);
  state.setError(null);
  
  try {
    // Load page-specific data before rendering
    await loadPageData(page);
    
    // Clear content
    pageContent.innerHTML = '';
    
    // Render page
    const renderFn = PAGES[page];
    if (renderFn) {
      await renderFn(pageContent);
    } else {
      pageContent.innerHTML = `
        <div class="container">
          <div class="empty-state">
            <div class="empty-state-icon">🚧</div>
            <h2>Page Under Construction</h2>
            <p>The ${page} page is being built.</p>
            <button class="btn" onclick="window.location.hash='dashboard'">
              ← Back to Dashboard
            </button>
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error('Page render error:', error);
    state.setError(error.message);
    pageContent.innerHTML = `
      <div class="container">
        <div class="alert alert-danger">
          <strong>Error loading page:</strong> ${error.message}
        </div>
        <button class="btn" onclick="window.location.reload()">
          🔄 Retry
        </button>
      </div>
    `;
  } finally {
    state.setLoading(false);
  }
  
  // Update sidebar active state
  updateSidebarActive(page);
}

/**
 * Load page-specific data from API
 */
async function loadPageData(page) {
  const user = getCurrentUser();
  const isDemo = state.get('demoMode');
  
  switch (page) {
    case 'dashboard':
      // Load stats, cameras, events
      const stats = isDemo 
        ? getDemoData('stats') 
        : await api.getDashboardStats();
      const cameras = isDemo
        ? getDemoData('cameras')
        : await api.getCameras();
      const events = isDemo
        ? getDemoData('events')
        : await api.getEvents({ limit: 10 });
      
      state.setStats(stats || {});
      state.setCameras(cameras);
      state.setEvents(events);
      break;
      
    case 'live':
      // Load cameras for selector
      if (state.get('cameras').length === 0) {
        const cameras = isDemo
          ? getDemoData('cameras')
          : await api.getCameras();
        state.setCameras(cameras);
      }
      break;
      
    case 'playback':
      // Load cameras for selector
      if (state.get('cameras').length === 0) {
        const cameras = isDemo
          ? getDemoData('cameras')
          : await api.getCameras();
        state.setCameras(cameras);
      }
      break;
      
    case 'cameras':
      // Admin only - load full camera list
      if (user?.role !== 'admin') {
        throw new Error('Access denied');
      }
      if (state.get('cameras').length === 0) {
        const cameras = isDemo
          ? getDemoData('cameras')
          : await api.getCameras();
        state.setCameras(cameras);
      }
      break;
      
    case 'users':
      // Admin only - load users
      if (user?.role !== 'admin') {
        throw new Error('Access denied');
      }
      const users = isDemo
        ? getDemoData('users')
        : await api.getUsers();
      state.setUsers(users);
      break;
      
    case 'settings':
      // Admin only - load settings
      if (user?.role !== 'admin') {
        throw new Error('Access denied');
      }
      const settings = isDemo
        ? {}
        : await api.getSettings();
      state.setSettings(settings || {});
      break;
  }
}

/**
 * Update sidebar active state
 */
function updateSidebarActive(page) {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.page === page) {
      link.classList.add('active');
    }
  });
}

/**
 * Initialize router and app
 */
export async function initApp() {
  // Check if we're on app.html
  if (!window.location.pathname.includes('app.html')) {
    return;
  }
  
  // Check authentication
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }
  
  // Check backend health
  const backendOnline = await api.healthCheck();
  state.setBackendOnline(backendOnline);
  state.setDemoMode(!backendOnline);
  
  // Render sidebar and navbar
  const sidebar = document.getElementById('sidebar');
  const navbar = document.getElementById('navbar');
  
  if (sidebar) sidebar.innerHTML = renderSidebar();
  if (navbar) navbar.innerHTML = renderNavbar();
  
  // Attach event listeners
  attachGlobalListeners();
  
  // Handle initial load
  await renderPage();
  
  // Handle hash changes
  window.addEventListener('hashchange', renderPage);
  
  // Periodic data refresh
  setupPeriodicRefresh();
}

/**
 * Attach global event listeners
 */
function attachGlobalListeners() {
  // Logout button
  document.getElementById('logout-btn')?.addEventListener('click', logout);
  
  // Notification toggle
  document.getElementById('notif-btn')?.addEventListener('click', () => {
    const panel = document.getElementById('notif-panel');
    panel?.classList.toggle('hidden');
  });
}

/**
 * Setup periodic data refresh
 */
function setupPeriodicRefresh() {
  // Refresh dashboard stats every 30 seconds
  setInterval(async () => {
    if (state.get('currentPage') === 'dashboard') {
      const stats = await api.getDashboardStats();
      if (stats) state.setStats(stats);
    }
  }, 30000);
  
  // Refresh notifications every minute
  setInterval(async () => {
    const notifications = await api.getNotifications({ limit: 5, unread_only: true });
    state.setNotifications(notifications);
    
    // Update badge count
    const badge = document.getElementById('notif-badge');
    if (badge && notifications.length > 0) {
      badge.textContent = notifications.length;
      badge.classList.remove('hidden');
    }
  }, 60000);
}

// Export for use in HTML
window.appRouter = { navigate };