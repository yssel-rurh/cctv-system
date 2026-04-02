// js/pages/dashboard.js - Dashboard Page Renderer

import { state } from '../state.js';
import { api, getDemoData } from '../api.js';
import { formatRiskScore } from '../config.js';

/**
 * Render dashboard page
 */
export async function renderDashboard(container) {
  const isDemo = state.get('demoMode');
  
  // Load data if not already loaded
  if (!state.get('stats') || state.get('stats').length === 0) {
    const stats = isDemo ? getDemoData('stats') : await api.getDashboardStats();
    state.setStats(stats || {});
  }
  
  if (state.get('cameras').length === 0) {
    const cameras = isDemo ? getDemoData('cameras') : await api.getCameras();
    state.setCameras(cameras);
  }
  
  if (state.get('events').length === 0) {
    const events = isDemo ? getDemoData('events') : await api.getEvents({ limit: 10 });
    state.setEvents(events);
  }
  
  const stats = state.get('stats') || {};
  const cameras = state.get('cameras') || [];
  const events = state.get('events') || [];
  
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title-large">📊 Dashboard</h1>
      <p class="page-subtitle">System overview and quick access</p>
    </div>
    
    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📹</div>
        <div class="stat-value">${stats.total_cameras || cameras.length}</div>
        <div class="stat-label">Total Cameras</div>
        <div class="stat-change positive">${stats.online_cameras || 0} Online</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">⚠️</div>
        <div class="stat-value">${stats.active_alerts || events.length}</div>
        <div class="stat-label">Active Alerts</div>
        <div class="stat-change negative">-1 from yesterday</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">💾</div>
        <div class="stat-value">${stats.storage_used_percent || 78}%</div>
        <div class="stat-label">Storage Used</div>
        <div class="stat-change">of total capacity</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🟢</div>
        <div class="stat-value">${stats.system_health === 'healthy' ? '98%' : 'N/A'}</div>
        <div class="stat-label">System Health</div>
        <div class="stat-change positive">All systems operational</div>
      </div>
    </div>
    
    <!-- Main Content Grid -->
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--spacing-lg);">
      <!-- Camera Overview -->
      <div>
        <h3 style="margin-bottom: var(--spacing-md);">📹 Camera Overview</h3>
        <div class="camera-grid">
          ${cameras.slice(0, 4).map(cam => `
            <div class="camera-card" onclick="window.appRouter.navigate('live', {camera: ${cam.id}})">
              <div class="camera-card-header">
                <span class="camera-card-name">📹 ${cam.name}</span>
                <span class="camera-card-status">
                  <span style="width: 8px; height: 8px; background: ${cam.status === 'online' ? 'var(--success)' : 'var(--danger)'}; border-radius: 50%;"></span>
                  ${cam.status}
                </span>
              </div>
              <div class="camera-card-preview">
                ${cam.status === 'online' ? '📡 Live Feed' : '⚠️ Offline'}
              </div>
              <div class="camera-card-footer">
                <span>📍 ${cam.location}</span>
                <span>ID: ${cam.id}</span>
              </div>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-outline" onclick="window.appRouter.navigate('live')">
          View All Cameras →
        </button>
      </div>
      
      <!-- Right Column -->
      <div>
        <!-- Risk Indicator -->
        <h3 style="margin-bottom: var(--spacing-md);">⚠️ AI Risk Analysis</h3>
        ${renderRiskIndicator(0.45)}
        
        <!-- Recent Alerts -->
        <h3 style="margin-bottom: var(--spacing-md); margin-top: var(--spacing-xl);">🔔 Recent Alerts</h3>
        <div class="event-timeline">
          ${events.slice(0, 5).map(event => `
            <div class="event-item ${event.risk_level === 'high' ? 'high-risk' : event.risk_level === 'medium' ? 'medium-risk' : 'low-risk'}">
              <div class="event-item-header">
                <strong>${event.event_type?.replace('_', ' ').toUpperCase() || 'EVENT'}</strong>
                <span class="event-item-time">${new Date(event.timestamp).toLocaleTimeString()}</span>
              </div>
              <div class="event-item-description">${event.description || 'No description'}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * Render risk indicator component
 */
function renderRiskIndicator(score) {
  const risk = formatRiskScore(score);
  
  return `
    <div class="risk-indicator">
      <div class="risk-circle" style="background-color: ${risk.color};">
        ${Math.round(score * 100)}%
      </div>
      <div class="risk-info">
        <div class="risk-label" style="color: ${risk.color};">${risk.label} RISK</div>
        <div class="risk-score">AI Analysis Score: ${score.toFixed(2)}</div>
        <div class="risk-bar">
          <div class="risk-bar-fill" style="width: ${score * 100}%; background-color: ${risk.color};"></div>
        </div>
      </div>
    </div>
  `;
}