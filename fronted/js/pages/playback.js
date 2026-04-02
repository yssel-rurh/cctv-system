// js/pages/playback.js - Playback Page Renderer

import { state } from '../state.js';
import { api, getDemoData } from '../api.js';
import { getCurrentUser } from '../auth.js';

/**
 * Render playback page
 */
export async function renderPlayback(container) {
  const user = getCurrentUser();
  const isDemo = state.get('demoMode');
  
  // Load cameras if not loaded
  if (state.get('cameras').length === 0) {
    const cameras = isDemo ? getDemoData('cameras') : await api.getCameras();
    state.setCameras(cameras);
  }
  
  const cameras = state.get('cameras') || [];
  
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title-large">📼 Video Playback</h1>
      <p class="page-subtitle">Review historical footage and events</p>
    </div>
    
    ${user?.role === 'officer' ? `
      <div class="alert alert-warning">
        ⚠️ Playback access is limited for officer roles. Contact admin for full history access.
      </div>
    ` : ''}
    
    <!-- Filters -->
    <div class="card" style="margin-bottom: var(--spacing-lg);">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-md);">
        <div class="form-group">
          <label for="playback-camera">Camera</label>
          <select id="playback-camera">
            <option value="all">All Cameras</option>
            ${cameras.map(cam => `
              <option value="${cam.id}">${cam.name}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label for="playback-date">Date</label>
          <input type="date" id="playback-date" value="${new Date().toISOString().split('T')[0]}" />
        </div>
        
        <div class="form-group">
          <label for="playback-start">Start Time</label>
          <input type="time" id="playback-start" value="00:00" />
        </div>
        
        <div class="form-group">
          <label for="playback-end">End Time</label>
          <input type="time" id="playback-end" value="23:59" />
        </div>
      </div>
      
      <button class="btn" style="margin-top: var(--spacing-md);" onclick="handlePlaybackSearch()">
        🔍 Search Footage
      </button>
    </div>
    
    <!-- Timeline Slider -->
    <div class="card" style="margin-bottom: var(--spacing-lg);">
      <h4 style="margin-bottom: var(--spacing-md);">📅 Timeline</h4>
      <input 
        type="range" 
        min="0" 
        max="100" 
        value="50" 
        style="width: 100%;"
        oninput="document.getElementById('timeline-value').textContent = this.value + '%'"
      />
      <div style="text-align: center; margin-top: var(--spacing-xs); color: var(--text-secondary);">
        <span id="timeline-value">50%</span> of selected time range
      </div>
    </div>
    
    <!-- Video Player -->
    <div class="video-player-container">
      <div class="video-player-header">
        <span class="video-player-title">📼 Playback - Selected Time</span>
      </div>
      <div class="video-player-content">
        <video controls style="width: 100%; height: 100%;">
          📼 Select date/time and click Search to load footage
        </video>
      </div>
    </div>
    
    <!-- Events Log -->
    <div class="card" style="margin-top: var(--spacing-lg);">
      <h4 style="margin-bottom: var(--spacing-md);">📋 Detected Events</h4>
      <div class="event-timeline">
        ${renderEventTimeline()}
      </div>
    </div>
  `;
  
  // Make search function available globally
  window.handlePlaybackSearch = () => {
    const camera = document.getElementById('playback-camera').value;
    const date = document.getElementById('playback-date').value;
    const start = document.getElementById('playback-start').value;
    const end = document.getElementById('playback-end').value;
    
    alert(`Searching footage...\nCamera: ${camera}\nDate: ${date}\nTime: ${start} - ${end}`);
    // In production: Call api.getPlaybackUrl() and update video source
  };
}

/**
 * Render event timeline (demo data)
 */
function renderEventTimeline() {
  const events = [
    { time: '14:32', cam: 'Camera 1', event: 'Motion detected', risk: 'low' },
    { time: '14:45', cam: 'Camera 2', event: 'Person detected', risk: 'medium' },
    { time: '15:10', cam: 'Camera 1', event: 'High risk alert', risk: 'high' },
  ];
  
  return events.map(e => `
    <div class="event-item ${e.risk === 'high' ? 'high-risk' : e.risk === 'medium' ? 'medium-risk' : 'low-risk'}">
      <div class="event-item-header">
        <strong>${e.time}</strong>
        <span class="event-item-time">${e.cam}</span>
      </div>
      <div class="event-item-description">${e.event}</div>
    </div>
  `).join('');
}