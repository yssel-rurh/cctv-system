// js/auth.js - Authentication Logic

import { api, getDemoData } from './api.js';
import { DEMO_USERS, ROLE_PERMISSIONS } from './config.js';
import { state } from './state.js';

/**
 * Check if user is currently authenticated
 */
export function isAuthenticated() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Get current user role
 */
export function getUserRole() {
  const user = getCurrentUser();
  return user?.role || null;
}

/**
 * Check if user can access a specific page
 */
export function canAccessPage(page) {
  const role = getUserRole();
  if (!role) return false;
  
  const permissions = ROLE_PERMISSIONS[role];
  return permissions?.pages?.includes(page) || false;
}

/**
 * Login with email/password (backend + demo fallback)
 */
export async function login(email, password) {
  try {
    // Try backend first
    const result = await api.login(email, password);
    
    if (result?.access_token) {
      // Backend login successful
      const user = result.user || { email, role: 'officer', name: email.split('@')[0] };
      localStorage.setItem('user', JSON.stringify(user));
      
      state.setUser(user);
      state.setAuthenticated(true);
      
      return { success: true, user, demoMode: false };
    }
  } catch (error) {
    console.warn('Backend login failed, trying demo mode');
  }
  
  // Fallback to demo mode
  const demoUser = DEMO_USERS[email];
  if (demoUser && demoUser.password === password) {
    const user = { ...demoUser, email };
    localStorage.setItem('token', 'demo-token');
    localStorage.setItem('user', JSON.stringify(user));
    
    state.setUser(user);
    state.setAuthenticated(true);
    
    return { success: true, user, demoMode: true };
  }
  
  return { success: false, message: 'Invalid email or password' };
}

/**
 * Logout and clear session
 */
export async function logout() {
  // Try backend logout (don't wait for response)
  api.logout().catch(() => {});
  
  // Clear local storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Clear state
  state.setAuthenticated(false);
  state.setUser(null);
  state.clear();
  
  // Redirect to login
  window.location.href = 'index.html';
}

/**
 * Initialize auth state on app load
 */
export function initAuth() {
  const user = getCurrentUser();
  if (user && isAuthenticated()) {
    state.setUser(user);
    state.setAuthenticated(true);
    return true;
  }
  return false;
}

/**
 * Get demo credentials for display
 */
export function getDemoCredentials() {
  return Object.entries(DEMO_USERS).map(([email, data]) => ({
    email,
    password: data.password,
    role: data.role,
    name: data.name,
  }));
}