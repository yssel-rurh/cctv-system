// js/components/sidebar.js - Sidebar Navigation Component

import { getCurrentUser, getUserRole, canAccessPage } from '../auth.js';
import { ROLE_PERMISSIONS } from '../config.js';
import { state } from '../state.js';

/**
 * Navigation items configuration
 */
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', page: 'dashboard' },
  { id: 'live', label: 'Live Feed', icon: '🔴', page: 'live' },
  { id: 'playback', label: 'Playback', icon: '📼', page: 'playback' },
  { id: 'cameras', label: 'Cameras', icon: '📹', page: 'cameras', adminOnly: true },
  { id: 'users', label: 'Users', icon: '👥', icon: '👥', page: 'users', adminOnly: true },
  { id: 'settings', label: 'Settings', icon: '⚙️', page: 'settings', adminOnly: true },
];

/**
 * Render sidebar HTML
 */
export function renderSidebar() {
  const user = getCurrentUser();
  const role = getUserRole();
  const isDemo = state.get('demoMode');
  const backendOnline = state.get('backendOnline');
  
  // Filter nav items by role
  const allowedItems = NAV_ITEMS.filter(item => {
    if (item.adminOnly && role !== 'admin') return false;
    return canAccessPage(item.page);
  });
  
  return `
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <span>🎥</span>
        <span>CCTV AI System</span>
      </div>
      <div class="sidebar-version">v2.0.0</div>
    </div>
    
    <div class="user-profile">
      <div class="user-avatar">${user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
      <div class="user-info">
        <div class="user-name">${user?.name || 'User'}</div>
        <div class="user-role">${role || 'Unknown'}</div>
      </div>
    </div>
    
    <nav class="sidebar-nav">
      ${allowedItems.map(item => `
        <button 
          class="nav-link ${state.get('currentPage') === item.page ? 'active' : ''}" 
          data-page="${item.page}"
          onclick="window.appRouter.navigate('${item.page}')"
        >
          <span class="nav-link-icon">${item.icon}</span>
          <span class="nav-link-label">${item.label}</span>
        </button>
      `).join('')}
    </nav>
    
    <div class="sidebar-footer">
      <div class="backend-status">
        <span class="status-dot ${backendOnline ? '' : 'offline'}"></span>
        <span>${backendOnline ? '🟢 Backend Connected' : '🔴 Demo Mode'}</span>
      </div>
      ${isDemo ? '<div style="font-size: 10px; color: var(--warning);">⚠️ Running in demo mode</div>' : ''}
      <button id="logout-btn" class="btn btn-danger btn-sm" style="width: 100%; margin-top: 8px;">
        🚪 Logout
      </button>
    </div>
  `;
}

/**
 * Update active nav link
 */
export function updateActiveNav(page) {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.page === page) {
      link.classList.add('active');
    }
  });
}