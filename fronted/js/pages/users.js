// js/pages/users.js - User Management Page (Admin Only)

import { state } from '../state.js';
import { api, getDemoData } from '../api.js';
import { getCurrentUser } from '../auth.js';

/**
 * Render users page
 */
export async function renderUsers(container) {
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
  
  // Load users if not loaded
  if (state.get('users').length === 0) {
    const users = isDemo ? getDemoData('users') : await api.getUsers();
    state.setUsers(users);
  }
  
  const users = state.get('users') || [];
  
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title-large">👥 User Management</h1>
      <p class="page-subtitle">Manage security officers and system access</p>
    </div>
    
    <!-- Add User Button -->
    <button class="btn btn-lg" style="margin-bottom: var(--spacing-lg);" onclick="toggleAddUserForm()">
      ➕ Add New User
    </button>
    
    <!-- Add User Form -->
    <div id="add-user-form" class="card hidden" style="margin-bottom: var(--spacing-lg);">
      <h4 style="margin-bottom: var(--spacing-md);">Add User Configuration</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
        <div class="form-group">
          <label for="user-name">Full Name</label>
          <input type="text" id="user-name" placeholder="e.g., John Doe" />
        </div>
        <div class="form-group">
          <label for="user-email">Email Address</label>
          <input type="email" id="user-email" placeholder="e.g., john@cctv.com" />
        </div>
        <div class="form-group">
          <label for="user-password">Password</label>
          <input type="password" id="user-password" placeholder="••••••••" />
        </div>
        <div class="form-group">
          <label for="user-role">Role</label>
          <select id="user-role">
            <option value="admin">Admin</option>
            <option value="officer">Officer</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
      </div>
      <div style="display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-md);">
        <button class="btn btn-success" onclick="handleAddUser()">✅ Create User</button>
        <button class="btn btn-outline" onclick="toggleAddUserForm()">❌ Cancel</button>
      </div>
    </div>
    
    <!-- Users Table -->
    <div class="card">
      <h4 style="margin-bottom: var(--spacing-md);">Current Users</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(u => `
            <tr>
              <td>${u.id}</td>
              <td>👤 ${u.name}</td>
              <td>${u.email}</td>
              <td><span class="badge badge-info">${u.role}</span></td>
              <td>
                <span class="badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}">
                  ${u.status}
                </span>
              </td>
              <td>${u.last_login || 'Never'}</td>
              <td>
                <button class="btn btn-sm btn-outline" onclick="handleEditUser(${u.id})">✏️</button>
                <button class="btn btn-sm btn-danger" onclick="handleDeleteUser(${u.id})">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <!-- Bulk Actions -->
    <div style="display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-lg);">
      <button class="btn btn-outline" onclick="alert('Select users to reset passwords')">🔑 Reset Passwords</button>
      <button class="btn btn-outline" onclick="alert('Select users to suspend')">🚫 Suspend Users</button>
      <button class="btn btn-danger" onclick="alert('Select users to delete')">🗑️ Delete Users</button>
    </div>
  `;
  
  // Make functions available globally
  window.toggleAddUserForm = () => {
    const form = document.getElementById('add-user-form');
    form.classList.toggle('hidden');
  };
  
  window.handleAddUser = async () => {
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('user-role').value;
    
    if (!name || !email || !password) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (isDemo) {
      alert(`User "${name}" created with role "${role}"! (Demo mode)`);
      toggleAddUserForm();
      renderUsers(container);
    } else {
      const result = await api.createUser({ name, email, password, role });
      if (result) {
        alert('User created successfully!');
        toggleAddUserForm();
        const users = await api.getUsers();
        state.setUsers(users);
        renderUsers(container);
      } else {
        alert('Failed to create user');
      }
    }
  };
  
  window.handleEditUser = (id) => {
    alert(`Edit user ${id} (Implement edit modal)`);
  };
  
  window.handleDeleteUser = async (id) => {
    if (confirm(`Are you sure you want to delete user ${id}?`)) {
      if (isDemo) {
        alert(`User ${id} deleted! (Demo mode)`);
        renderUsers(container);
      } else {
        await api.deleteUser(id);
        const users = await api.getUsers();
        state.setUsers(users);
        renderUsers(container);
      }
    }
  };
}