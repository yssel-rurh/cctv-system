// js/pages/settings.js - Settings Page (Admin Only)

import { state } from '../state.js';
import { api } from '../api.js';
import { getCurrentUser } from '../auth.js';
import { API_CONFIG } from '../config.js';

/**
 * Render settings page
 */
export async function renderSettings(container) {
  const user = getCurrentUser();
  const isDemo = state.get('demoMode');
  
  // Admin check
  if (user?.role !== 'admin') {
    container.innerHTML = `
      <div class="alert alert-danger">
        🚫 Access Denied. This page is for administrators only.
      </div>
      <button class="btn" onclick="window.appRouter.navigate('dashboard')">
        ← Back to Dashboard
      </button>
    `;
    return;
  }
  
  // Load settings if not loaded
  if (!state.get('settings')) {
    const settings = isDemo ? {} : await api.getSettings();
    state.setSettings(settings || {});
  }
  
  const settings = state.get('settings') || {};
  
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title-large">⚙️ System Settings</h1>
      <p class="page-subtitle">Configure system parameters and preferences</p>
    </div>
    
    <!-- Settings Tabs -->
    <div style="display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-lg); border-bottom: 1px solid var(--border-color); padding-bottom: var(--spacing-sm);">
      <button class="btn btn-outline" onclick="showSettingsTab('general')">🔧 General</button>
      <button class="btn btn-outline" onclick="showSettingsTab('security')">🔐 Security</button>
      <button class="btn btn-outline" onclick="showSettingsTab('cameras')">📹 Cameras</button>
      <button class="btn btn-outline" onclick="showSettingsTab('notifications')">🔔 Notifications</button>
    </div>
    
    <!-- General Tab -->
    <div id="settings-general" class="settings-tab">
      <div class="card">
        <h4 style="margin-bottom: var(--spacing-md);">General Settings</h4>
        <div class="form-group">
          <label for="sys-name">System Name</label>
          <input type="text" id="sys-name" value="CCTV AI Security System" />
        </div>
        <div class="form-group">
          <label for="api-url">API Base URL</label>
          <input type="text" id="api-url" value="${API_CONFIG.BASE_URL}" />
        </div>
        <div class="form-group">
          <label for="refresh-interval">Auto-Refresh Interval (seconds)</label>
          <input type="number" id="refresh-interval" min="1" max="300" value="5" />
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" checked /> Enable Auto-Backup
          </label>
        </div>
        <button class="btn" onclick="handleSaveSettings('general')">💾 Save General Settings</button>
      </div>
    </div>
    
    <!-- Security Tab -->
    <div id="settings-security" class="settings-tab hidden">
      <div class="card">
        <h4 style="margin-bottom: var(--spacing-md);">Security Settings</h4>
        <div class="form-group">
          <label>
            <input type="checkbox" /> Enable Two-Factor Authentication
          </label>
        </div>
        <div class="form-group">
          <label for="session-timeout">Session Timeout (minutes)</label>
          <input type="number" id="session-timeout" min="5" max="480" value="60" />
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" checked /> Require Password Change Every 90 Days
          </label>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" checked /> Log All Admin Actions
          </label>
        </div>
        <button class="btn" onclick="handleSaveSettings('security')">💾 Save Security Settings</button>
      </div>
    </div>
    
    <!-- Cameras Tab -->
    <div id="settings-cameras" class="settings-tab hidden">
      <div class="card">
        <h4 style="margin-bottom: var(--spacing-md);">Camera Settings</h4>
        <div class="form-group">
          <label>
            <input type="checkbox" checked /> Auto-Detect New Cameras
          </label>
        </div>
        <div class="form-group">
          <label for="max-cameras">Maximum Cameras Allowed</label>
          <input type="number" id="max-cameras" min="1" max="100" value="50" />
        </div>
        <div class="form-group">
          <label for="recording-quality">Default Recording Quality</label>
          <select id="recording-quality">
            <option value="720p">720p</option>
            <option value="1080p" selected>1080p</option>
            <option value="4K">4K</option>
          </select>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" checked /> Enable Motion-Triggered Recording
          </label>
        </div>
        <button class="btn" onclick="handleSaveSettings('cameras')">💾 Save Camera Settings</button>
      </div>
    </div>
    
    <!-- Notifications Tab -->
    <div id="settings-notifications" class="settings-tab hidden">
      <div class="card">
        <h4 style="margin-bottom: var(--spacing-md);">Notification Settings</h4>
        <div class="form-group">
          <label>
            <input type="checkbox" checked /> Email Alerts
          </label>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" /> SMS Alerts
          </label>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" checked /> Desktop Notifications
          </label>
        </div>
        <div class="form-group">
          <label>Alert Types to Notify</label>
          <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-sm);">
            <label><input type="checkbox" checked /> Motion</label>
            <label><input type="checkbox" checked /> Person</label>
            <label><input type="checkbox" checked /> Vehicle</label>
            <label><input type="checkbox" checked /> High Risk</label>
            <label><input type="checkbox" checked /> Camera Offline</label>
          </div>
        </div>
        <button class="btn" onclick="handleSaveSettings('notifications')">💾 Save Notification Settings</button>
      </div>
    </div>
  `;
  
  // Make functions available globally
  window.showSettingsTab = (tab) => {
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.add('hidden'));
    document.getElementById(`settings-${tab}`).classList.remove('hidden');
  };
  
  window.handleSaveSettings = (tab) => {
    alert(`${tab} settings saved successfully!`);
    // In production: Call api.updateSettings()
  };
}