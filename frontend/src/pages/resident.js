import '../styles/global.css';
import './dashboard.css';
import { apiFetch, requireAuth, clearAuth, toast, setLoading, openModal, closeModal, badgeHtml, fmtDate } from '../js/utils.js';

window.openModal = openModal;
window.closeModal = closeModal;

const user = requireAuth('resident');
if (!user) throw new Error('Auth required');

// ── Init UI ──
document.getElementById('user-avatar').textContent = user.firstName[0].toUpperCase();
document.getElementById('welcome-msg').textContent = `Hello, ${user.firstName}!`;
document.getElementById('welcome-date').textContent = new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const dateInput = document.getElementById('appt-date');
if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

let allAppts = [];

// ── Tab switching ──
const allTabs   = document.querySelectorAll('[data-tab]');
const allPanels = document.querySelectorAll('.tab-content');

allTabs.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

window.switchTab = (name) => {
  allPanels.forEach(p => p.classList.remove('active'));
  allTabs.forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${name}`)?.classList.add('active');
  document.querySelectorAll(`[data-tab="${name}"]`).forEach(b => b.classList.add('active'));
};

window.logout = () => { clearAuth(); window.location.href = '/index.html'; };

// ── Load appointments ──
const loadAppts = async () => {
  try {
    allAppts = await apiFetch('/resident/appointments');
    renderAppts(allAppts);
    renderRecent(allAppts);
    updateStats();
  } catch (err) { toast(err.message, 'error'); }
};

const updateStats = () => {
  document.getElementById('stat-total').textContent   = allAppts.length;
  document.getElementById('stat-pending').textContent  = allAppts.filter(a => a.status === 'pending').length;
  document.getElementById('stat-approved').textContent = allAppts.filter(a => a.status === 'approved').length;
  document.getElementById('stat-done').textContent     = allAppts.filter(a => a.status === 'completed').length;
};

const renderAppts = (list) => {
  const grid = document.getElementById('appts-grid');
  if (!list.length) {
    grid.innerHTML = `<div class="empty-state"><div class="icon">📅</div><p>No appointments yet. Tap "+ New" to request a document.</p></div>`;
    return;
  }
  grid.innerHTML = list.map(apptCard).join('');
};

const renderRecent = (list) => {
  const el = document.getElementById('recent-list');
  const recent = list.slice(0, 4);
  if (!recent.length) {
    el.innerHTML = `<div style="padding:20px;text-align:center;color:var(--gray-400);font-size:13px;">No appointments yet.</div>`;
    return;
  }
  el.innerHTML = recent.map(a => `
    <div class="mini-row">
      <div>
        <div style="font-weight:600;font-size:14px;">${a.documentType}</div>
        <div style="font-size:12px;color:var(--gray-400);">${fmtDate(a.preferredDate)} · ${a.preferredTime}</div>
      </div>
      ${badgeHtml(a.status)}
    </div>`).join('');
};

const apptCard = (a) => `
  <div class="appt-card">
    <div class="appt-card-top">
      <span class="appt-doc-type">${a.documentType}</span>
      ${badgeHtml(a.status)}
    </div>
    <div class="appt-purpose">${a.purpose}</div>
    <div class="appt-row">📅 <span>${fmtDate(a.preferredDate)} · ${a.preferredTime}</span></div>
    ${a.status === 'rescheduled' && a.rescheduledDate
      ? `<div class="appt-reschedule">↩️ Rescheduled: ${fmtDate(a.rescheduledDate)} at ${a.rescheduledTime}</div>` : ''}
    ${a.adminRemarks ? `<div class="appt-remark">💬 ${a.adminRemarks}</div>` : ''}
    <div class="appt-meta">Submitted ${fmtDate(a.createdAt)}</div>
  </div>`;

window.filterAppts = () => {
  const val = document.getElementById('appt-filter').value;
  renderAppts(val ? allAppts.filter(a => a.status === val) : allAppts);
};

// ── Profile ──
document.getElementById('profile-body').innerHTML = `
  <div class="profile-avatar">
    <div class="profile-icon">${user.firstName[0]}${user.lastName[0]}</div>
    <div>
      <h3 style="margin:0;font-size:18px;">${user.firstName} ${user.lastName}</h3>
      <span class="badge badge-approved" style="margin-top:4px;">Approved Resident</span>
    </div>
  </div>
  <div class="profile-grid">
    <div class="profile-field"><span class="profile-label">Email</span><span style="font-size:14px;">${user.email}</span></div>
    <div class="profile-field"><span class="profile-label">Role</span><span style="font-size:14px;text-transform:capitalize;">${user.role}</span></div>
  </div>`;

// ── Multi-step modal ──
let currentStep = 1;
const totalSteps = 3;

const goToStep = (n) => {
  currentStep = n;
  for (let i = 1; i <= totalSteps; i++) {
    document.getElementById(`modal-step-${i}`).style.display = i === n ? 'block' : 'none';
    const dot = document.getElementById(`step-dot-${i}`);
    dot.classList.toggle('active', i <= n);
    dot.classList.toggle('done', i < n);
  }
  document.getElementById('modal-back-btn').style.display = n > 1 ? 'inline-flex' : 'none';
  const nextBtn = document.getElementById('modal-next-btn');
  nextBtn.textContent = n === totalSteps ? 'Submit' : 'Next →';
};

window.modalBack = () => { if (currentStep > 1) goToStep(currentStep - 1); };

window.modalNext = async () => {
  const alertEl = document.getElementById('appt-alert');
  alertEl.innerHTML = '';

  if (currentStep === 1) {
    const docType = document.getElementById('doc-type').value;
    const purpose = document.getElementById('doc-purpose').value.trim();
    if (!docType) { alertEl.innerHTML = '<div class="alert alert-error">Please select a document type.</div>'; return; }
    if (!purpose)  { alertEl.innerHTML = '<div class="alert alert-error">Please state the purpose.</div>'; return; }
    goToStep(2);

  } else if (currentStep === 2) {
    const date = document.getElementById('appt-date').value;
    const time = document.getElementById('appt-time').value;
    if (!date) { alertEl.innerHTML = '<div class="alert alert-error">Please select a date.</div>'; return; }
    if (!time) { alertEl.innerHTML = '<div class="alert alert-error">Please select a time slot.</div>'; return; }

    // Build confirm summary
    document.getElementById('confirm-summary').innerHTML = `
      <div class="summary-row"><span>Document</span><strong>${document.getElementById('doc-type').value}</strong></div>
      <div class="summary-row"><span>Purpose</span><strong>${document.getElementById('doc-purpose').value}</strong></div>
      <div class="summary-row"><span>Date</span><strong>${new Date(date).toLocaleDateString('en-PH', {weekday:'long',year:'numeric',month:'long',day:'numeric'})}</strong></div>
      <div class="summary-row"><span>Time</span><strong>${time}</strong></div>
    `;
    goToStep(3);

  } else if (currentStep === 3) {
    const btn = document.getElementById('modal-next-btn');
    setLoading(btn, true, 'Submitting...');
    try {
      await apiFetch('/resident/appointments', {
        method: 'POST',
        body: JSON.stringify({
          documentType:  document.getElementById('doc-type').value,
          purpose:       document.getElementById('doc-purpose').value.trim(),
          preferredDate: document.getElementById('appt-date').value,
          preferredTime: document.getElementById('appt-time').value,
          occupation:    document.getElementById('doc-occupation')?.value || '',
          civilStatus:   document.getElementById('doc-civil')?.value || '',
          monthlyIncome: document.getElementById('doc-income')?.value || '',
        }),
      });
      toast('Appointment submitted! Awaiting admin approval.', 'success');
      closeModal('appt-modal');
      resetModal();
      loadAppts();
    } catch (err) {
      alertEl.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
      setLoading(btn, false);
    }
  }
};

const resetModal = () => {
  document.getElementById('doc-type').value = '';
  document.getElementById('doc-purpose').value = '';
  document.getElementById('appt-date').value = '';
  document.getElementById('appt-time').value = '';
  document.getElementById('cedula-fields').style.display = 'none';
  document.getElementById('appt-alert').innerHTML = '';
  goToStep(1);
};

// Time slot buttons
document.querySelectorAll('.time-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('appt-time').value = btn.dataset.time;
  });
});

// Cedula extra fields toggle
document.getElementById('doc-type')?.addEventListener('change', (e) => {
  document.getElementById('cedula-fields').style.display = e.target.value === 'Cedula' ? 'block' : 'none';
});

// Close modal on backdrop
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', (e) => { if (e.target === o) { o.classList.remove('active'); resetModal(); } });
});

// ── Init ──
loadAppts();
