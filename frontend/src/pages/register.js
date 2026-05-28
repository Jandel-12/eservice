import '../styles/global.css';
import './register.css';
import { apiFetch, toast, setLoading } from '../js/utils.js';

const form = document.getElementById('reg-form');
const alertBox = document.getElementById('alert-box');
const successBox = document.getElementById('success-box');

const showAlert = (msg, type = 'error') => {
  alertBox.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

const clearAlert = () => { alertBox.innerHTML = ''; };

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert();

  const firstName = document.getElementById('firstName').value.trim();
  const lastName  = document.getElementById('lastName').value.trim();
  const birthdate = document.getElementById('birthdate').value;
  const gender    = document.getElementById('gender').value;
  const address   = document.getElementById('address').value.trim();
  const phone     = document.getElementById('phone').value.trim();
  const email     = document.getElementById('email').value.trim();
  const password  = document.getElementById('password').value;
  const confirm   = document.getElementById('confirmPassword').value;

  // Validation
  if (!firstName || !lastName || !birthdate || !gender || !address || !phone || !email || !password) {
    return showAlert('Please fill out all required fields.');
  }
  if (!/^09\d{9}$/.test(phone)) {
    return showAlert('Please enter a valid Philippine phone number (e.g. 09XXXXXXXXX).');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return showAlert('Please enter a valid email address.');
  }
  if (password.length < 6) {
    return showAlert('Password must be at least 6 characters.');
  }
  if (password !== confirm) {
    return showAlert('Passwords do not match.');
  }

  const btn = document.getElementById('reg-btn');
  setLoading(btn, true, 'Submitting...');

  try {
    await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, birthdate, gender, address, phone, email, password }),
    });

    form.style.display = 'none';
    successBox.style.display = 'flex';
    toast('Registration submitted successfully!', 'success');
  } catch (err) {
    setLoading(btn, false);
    showAlert(err.message);
  }
});
