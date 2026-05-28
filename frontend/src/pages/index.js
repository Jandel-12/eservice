import '../styles/global.css';
import './login.css';
import { apiFetch, setAuth, getUser, getToken, toast, setLoading } from '../js/utils.js';

// Redirect if already logged in
const user = getUser();
const token = getToken();
if (token && user) {
  window.location.href = user.role === 'admin' ? '/admin.html' : '/resident.html';
}

const form = document.getElementById('login-form');
const alertBox = document.getElementById('alert-box');

const showAlert = (msg, type = 'error') => {
  alertBox.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  alertBox.innerHTML = '';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const btn = document.getElementById('login-btn');

  if (!email || !password) return showAlert('Please enter your email and password.');

  setLoading(btn, true, 'Signing in...');
  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuth(data.token, data.user);
    toast('Login successful! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = data.user.role === 'admin' ? '/admin.html' : '/resident.html';
    }, 800);
  } catch (err) {
    setLoading(btn, false);
    showAlert(err.message);
  }
});

window.togglePw = () => {
  const pw = document.getElementById('password');
  pw.type = pw.type === 'password' ? 'text' : 'password';
};

window.fillAdmin = () => {
  document.getElementById('email').value = 'admin@talolong.gov.ph';
  document.getElementById('password').value = 'admin123';
  toast('Admin credentials filled in.', 'info');
};
