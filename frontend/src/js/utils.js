// API base URL — change to your deployed backend
export const API_URL = '/api';

// ─── Auth helpers ───
export const getToken = () => localStorage.getItem('eservice_token');
export const getUser  = () => JSON.parse(localStorage.getItem('eservice_user') || 'null');

export const setAuth = (token, user) => {
  localStorage.setItem('eservice_token', token);
  localStorage.setItem('eservice_user', JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem('eservice_token');
  localStorage.removeItem('eservice_user');
};

export const requireAuth = (role = null) => {
  const user = getUser();
  const token = getToken();
  if (!token || !user) { window.location.href = '/index.html'; return null; }
  if (role && user.role !== role) {
    window.location.href = user.role === 'admin' ? '/admin.html' : '/resident.html';
    return null;
  }
  return user;
};

// ─── API fetch wrapper ───
export const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
};

// ─── Toast notifications ───
const ensureToastContainer = () => {
  let el = document.getElementById('toast-container');
  if (!el) { el = document.createElement('div'); el.id = 'toast-container'; document.body.appendChild(el); }
  return el;
};

export const toast = (message, type = 'info', duration = 3500) => {
  const container = ensureToastContainer();
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  t.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${message}</span>`;
  container.appendChild(t);
  setTimeout(() => { t.style.animation = 'none'; t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, duration);
};

// ─── Status badge ───
export const badgeHtml = (status) => `<span class="badge badge-${status}">${status}</span>`;

// ─── Date formatting ───
export const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
export const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// ─── Modal helpers ───
export const openModal = (id) => document.getElementById(id)?.classList.add('active');
export const closeModal = (id) => document.getElementById(id)?.classList.remove('active');

// ─── Loading button state ───
export const setLoading = (btn, loading, text = 'Loading...') => {
  if (loading) {
    btn.dataset.origText = btn.innerHTML;
    btn.innerHTML = `<span class="loader"></span> ${text}`;
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.origText || text;
    btn.disabled = false;
  }
};
