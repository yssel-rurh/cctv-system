// js/pages/cameras.js - Camera Management Page (Admin Only)

import { state } from '../state.js';
import { api, getDemoData } from '../api.js';
import { getCurrentUser } from '../auth.js';

/**
 * Render cameras page
 */
export async function renderCameras(container) {
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
  
  // Load cameras if not loaded
  if (state.get('cameras').length === 0) {
    const cameras = isDemo ? getDemoData('cameras') : await api.getCameras();
    state.setCameras(cameras);
  }
  
  const cameras = state.get('cameras') || [];
  
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title-large">📹 Camera Management</h1>
      <p class="page-subtitle">Add, edit, or remove security cameras</p>
    </div>
    
    <!-- Add Camera Button -->
    <button class="btn btn-lg" style="margin-bottom: var(--spacing-lg);" onclick="toggleAddCameraForm()">
      ➕ Add New Camera
    </button>
    
    <!-- Add Camera Form -->
    <div id="add-camera-form" class="card hidden" style="margin-bottom: var(--spacing-lg);">
      <h4 style="margin-bottom: var(--spacing-md);">Add Camera Configuration</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
        <div class="form-group">
          <label for="cam-name">Camera Name</label>
          <input type="text" id="cam-name" placeholder="e.g., Entrance Main" />
        </div>
        <div class="form-group">
          <label for="cam-location">Location</label>
          <input type="text" id="cam-location" placeholder="e.g., Front Door" />
        </div>
        <div class="form-group">
          <label for="cam-ip">IP Address</label>
          <input type="text" id="cam-ip" placeholder="e.g., 192.168.1.101" />
        </div>
        <div class="form-group">
          <label for="cam-type">Type</label>
          <select id="cam-type">
            <option value="IP Camera">IP Camera</option>
            <option value="Analog">Analog</option>
            <option value="PTZ">PTZ</option>
            <option value="Dome">Dome</option>
          </select>
        </div>
      </div>
      <div style="display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-md);">
        <button class="btn btn-success" onclick="handleAddCamera()">✅ Add Camera</button>
        <button class="btn btn-outline" onclick="toggleAddCameraForm()">❌ Cancel</button>
      </div>
    </div>
    
    <!-- Cameras Table -->
    <div class="card">
      <h4 style="margin-bottom: var(--spacing-md);">All Cameras</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Location</th>
            <th>IP Address</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${cameras.map(cam => `
            <tr>
              <td>${cam.id}</td>
              <td>📹 ${cam.name}</td>
              <td>📍 ${cam.location}</td>
              <td><code>${cam.ip || 'N/A'}</code></td>
              <td>
                <span class="badge ${cam.status === 'online' ? 'badge-success' : 'badge-danger'}">
                  ${cam.status}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-outline" onclick="handleEditCamera(${cam.id})">✏️</button>
                <button class="btn btn-sm btn-danger" onclick="handleDeleteCamera(${cam.id})">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <!-- Action Buttons -->
    <div style="display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-lg);">
      <button class="btn btn-outline" onclick="handleRefreshCameras()">🔄 Refresh Status</button>
    </div>
  `;
  
  // Make functions available globally
  window.toggleAddCameraForm = () => {
    const form = document.getElementById('add-camera-form');
    form.classList.toggle('hidden');
  };
  
  window.handleAddCamera = async () => {
    const name = document.getElementById('cam-name').value;
    const location = document.getElementById('cam-location').value;
    const ip = document.getElementById('cam-ip').value;
    const type = document.getElementById('cam-type').value;
    
    if (!name || !location) {
      alert('Please fill in required fields');
      return;
    }
    
    if (isDemo) {
      alert(`Camera "${name}" added successfully! (Demo mode)`);
      toggleAddCameraForm();
      renderCameras(container);
    } else {
      const result = await api.createCamera({ name, location, ip_address: ip, type });
      if (result) {
        alert('Camera added successfully!');
        toggleAddCameraForm();
        const cameras = await api.getCameras();
        state.setCameras(cameras);
        renderCameras(container);
      } else {
        alert('Failed to add camera');
      }
    }
  };
  
  window.handleEditCamera = (id) => {
    alert(`Edit camera ${id} (Implement edit modal)`);
  };
  
  window.handleDeleteCamera = async (id) => {
    if (confirm(`Are you sure you want to delete camera ${id}?`)) {
      if (isDemo) {
        alert(`Camera ${id} deleted! (Demo mode)`);
        renderCameras(container);
      } else {
        await api.deleteCamera(id);
        const cameras = await api.getCameras();
        state.setCameras(cameras);
        renderCameras(container);
      }
    }
  };
  
  window.handleRefreshCameras = async () => {
    const cameras = isDemo ? getDemoData('cameras') : await api.getCameras();
    state.setCameras(cameras);
    renderCameras(container);
    alert('Camera status refreshed!');
  };
}