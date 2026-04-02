// js/pages/live-feed.js - Live Feed Page Renderer

import { state } from '../state.js';
import { api, getDemoData } from '../api.js';
import { formatRiskScore } from '../config.js';

/**
 * Render live feed page
 */
export async function renderLiveFeed(container) {
  const isDemo = state.get('demoMode');
  
  // Load cameras if not loaded
  if (state.get('cameras').length === 0) {
    const cameras = isDemo ? getDemoData('cameras') : await api.getCameras();
    state.setCameras(cameras);
  }
  
  const cameras = state.get('cameras') || [];
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  const selectedCameraId = urlParams.get('camera') || cameras[0]?.id;
  const selectedCamera = cameras.find(c => c.id == selectedCameraId);
  
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title-large">🔴 Live Feed Monitoring</h1>
      <p class="page-subtitle">Real-time camera streams with AI analysis</p>
    </div>
    
    <!-- Camera Selector -->
    <div class="card" style="margin-bottom: var(--spacing-lg);">
      <div class="form-group" style="margin: 0;">
        <label for="camera-select">Select Camera</label>
        <select id="camera-select" onchange="handleCameraChange(this.value)">
          ${cameras.map(cam => `
            <option value="${cam.id}" ${cam.id == selectedCameraId ? 'selected' : ''}>
              ${cam.name} (${cam.status})
            </option>
          `).join('')}
        </select>
      </div>
    </div>
    
    <!-- Video Player -->
    ${selectedCamera ? `
      <div class="video-player-container">
        <div class="video-player-header">
          <span class="video-player-title">📹 ${selectedCamera.name} - Live</span>
          <span class="live-badge">LIVE</span>
        </div>
        <div class="video-player-content">
          <video 
            id="live-video" 
            autoplay 
            muted 
            playsinline
            style="width: 100%; height: 100%;"
          >
            <source src="${api.getLiveStreamUrl(selectedCamera.id)}" type="video/mp4">
            📡 Stream Placeholder - Connect to backend for live video
          </video>
        </div>
        <div class="video-player-controls">
          <button class="btn btn-sm btn-outline">⏸️ Pause</button>
          <button class="btn btn-sm btn-outline">📸 Snapshot</button>
          <button class="btn btn-sm btn-outline">🔊 Mute</button>
          <button class="btn btn-sm btn-outline">⛶ Fullscreen</button>
        </div>
      </div>
    ` : `
      <div class="card">
        <div class="empty-state">
          <div class="empty-state-icon">📹</div>
          <h3>No Cameras Available</h3>
          <p>Please add cameras in the admin panel.</p>
        </div>
      </div>
    `}
    
    <!-- AI Analysis Panel -->
    ${selectedCamera ? `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg); margin-top: var(--spacing-lg);">
        <!-- Risk Score -->
        <div class="card">
          <h4 style="margin-bottom: var(--spacing-md);">🤖 Current Risk Level</h4>
          ${renderRiskIndicator(0.35)}
        </div>
        
        <!-- Detected Objects -->
        <div class="card">
          <h4 style="margin-bottom: var(--spacing-md);">🔍 Detected Objects</h4>
          <ul style="list-style: none; color: var(--text-secondary);">
            <li style="padding: var(--spacing-xs) 0;">👤 Person (2)</li>
            <li style="padding: var(--spacing-xs) 0;">🚗 Vehicle (1)</li>
            <li style="padding: var(--spacing-xs) 0;">🎒 Bag (1)</li>
            <li style="padding: var(--spacing-xs) 0;">🕐 Time: Unusual hour</li>
          </ul>
        </div>
      </div>
    ` : ''}
  `;
  
  // Make handleCameraChange available globally
  window.handleCameraChange = (cameraId) => {
    window.appRouter.navigate('live', { camera: cameraId });
  };
}

/**
 * Render risk indicator (reused from dashboard)
 */
function renderRiskIndicator(score) {
  const risk = formatRiskScore(score);
  
  return `
    <div class="risk-indicator" style="margin: 0;">
      <div class="risk-circle" style="width: 60px; height: 60px; font-size: var(--font-size-lg); background-color: ${risk.color};">
        ${Math.round(score * 100)}%
      </div>
      <div class="risk-info">
        <div class="risk-label" style="font-size: var(--font-size-md); color: ${risk.color};">${risk.label}</div>
        <div class="risk-score">Score: ${score.toFixed(2)}</div>
      </div>
    </div>
  `;
}