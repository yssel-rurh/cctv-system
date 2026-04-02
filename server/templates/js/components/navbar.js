// js/components/navbar.js - Top Navbar Component

import { getCurrentUser } from '../auth.js';
import { state } from '../state.js';

/**
 * Format current date/time
 */
function formatDateTime() {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get page title from current route
 */
function getPageTitle() {
  const page = state.get('currentPage') || 'dashboard';
  const titles = {
    dashboard: 'Dashboard',
    live: 'Live Feed Monitoring',
    playback: 'Video Playback',
    cameras: 'Camera Management',
    users: 'User Management',
    settings: 'System Settings',
  };
  return titles[page] || 'Dashboard';
}

/**
 * Render navbar HTML
 */
export function renderNavbar() {
  const user = getCurrentUser();
  const notifications = state.get('notifications') || [];
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return `
    <div class="navbar-left">
      <h2 class="page-title">${getPageTitle()}</h2>
    </div>
    
    <div class="navbar-right">
      <span style="font-size: var(--font-size-sm); color: var(--text-secondary);">
        📅 ${formatDateTime()}
      </span>
      
      <button id="notif-btn" class="navbar-icon-btn" title="Notifications">
        🔔
        ${unreadCount > 0 ? `<span id="notif-badge" class="notif-badge">${unreadCount}</span>` : ''}
      </button>
      
      <div id="notif-panel" class="hidden">
        <div class="notif-header">
          🔔 Recent Notifications
          <button onclick="document.getElementById('notif-panel').classList.add('hidden')" 
                  style="float: right; background: none; border: none; color: var(--text-secondary); cursor: pointer;">
            ✕
          </button>
        </div>
        ${notifications.length > 0 
          ? notifications.slice(0, 5).map(n => `
              <div class="notif-item ${!n.read ? 'unread' : ''}">
                <div class="notif-title">${n.title || 'Notification'}</div>
                <div class="notif-time">${new Date(n.timestamp).toLocaleString()}</div>
              </div>
            `).join('')
          : '<div class="notif-item">No new notifications</div>'
        }
      </div>
      
      <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
        <div style="width: 32px; height: 32px; background: var(--accent-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
          ${user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <span style="font-size: var(--font-size-sm); font-weight: 500;">${user?.name?.split(' ')[0] || 'User'}</span>
      </div>
    </div>
  `;
}

/**
 * Update navbar (called periodically)
 */
export function updateNavbar() {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.innerHTML = renderNavbar();
  }
}