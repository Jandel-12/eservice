import '../styles/global.css';
import './dashboard.css';
import { apiFetch, requireAuth, clearAuth, toast, setLoading, openModal, closeModal, badgeHtml, fmtDate } from '../js/utils.js';

window.openModal = openModal;
window.closeModal = closeModal;

const user = requireAuth('admin');
if (!user) throw new Error('Admin auth required');

document.getElementById('admin-date').textContent = new Date().toLocaleDateString('en-PH', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

// Detect desktop vs mobile for appointments view
const isDesktop = () => window.innerWidth >= 768;

// ── Tabs ──
const allTabs = document.querySelectorAll('[data-tab]');
allTabs.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

window.switchTab = (name) => {
  document.querySelectorAll('.tab-content').forEach(p => p.classList.remove('active'));
  allTabs.forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${name}`)?.classList.add('active');
  document.querySelectorAll(`[data-tab="${name}"]`).forEach(b => b.classList.add('active'));
};

window.logout = () => { clearAuth(); window.location.href = '/index.html'; };

// ── State ──
let allReg   = [];
let allAppts = [];

window.loadAll = async () => {
  await Promise.all([loadStats(), loadRegistrations(), loadResidents(), loadAppts()]);
};

// ── Stats ──
const loadStats = async () => {
  try {
    const s = await apiFetch('/admin/stats');
    document.getElementById('s-residents').textContent     = s.totalResidents;
    document.getElementById('s-pending-reg').textContent   = s.pendingRegistrations;
    document.getElementById('s-total-appts').textContent   = s.totalAppts;
    document.getElementById('s-pending-appts').textContent = s.pendingAppts;
    setBadge('badge-reg',   s.pendingRegistrations);
    setBadge('badge-appts', s.pendingAppts);
  } catch (err) { toast('Failed to load stats', 'error'); }
};
const setBadge = (id, n) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = n > 0 ? 'inline-flex' : 'none';
  el.textContent = n;
};

// ── REGISTRATIONS ──
const loadRegistrations = async () => {
  try {
    allReg = await apiFetch('/admin/users?role=resident');
    filterRegistrations();
    // overview: pending only
    renderOvReg(allReg.filter(u => u.status === 'pending').slice(0, 5));
  } catch {}
};

window.filterRegistrations = () => {
  const val = document.getElementById('reg-filter')?.value;
  renderRegGrid(val ? allReg.filter(u => u.status === val) : allReg);
};

const renderRegGrid = (users) => {
  const grid = document.getElementById('reg-grid');
  if (!users.length) { grid.innerHTML = `<div class="empty-state"><div class="icon">🧑‍🤝‍🧑</div><p>No registrations found.</p></div>`; return; }
  grid.innerHTML = users.map(u => `
    <div class="user-card">
      <div class="user-card-top">
        <div class="user-card-avatar">${u.firstName[0]}${u.lastName[0]}</div>
        <div style="flex:1;min-width:0;">
          <div class="user-card-name">${u.firstName} ${u.lastName}</div>
          <div class="user-card-email">${u.email}</div>
        </div>
        ${badgeHtml(u.status)}
      </div>
      <div class="user-card-body">
        <div><strong>Phone:</strong> ${u.phone}</div>
        <div><strong>Address:</strong> ${u.address}</div>
        <div><strong>Registered:</strong> ${fmtDate(u.createdAt)}</div>
        ${u.rejectionReason ? `<div style="color:var(--danger);margin-top:4px;"><strong>Reason:</strong> ${u.rejectionReason}</div>` : ''}
      </div>
      ${u.status === 'pending' ? `
        <div class="user-card-actions">
          <button class="btn btn-success btn-sm" onclick="approveUser('${u._id}')">✓ Approve</button>
          <button class="btn btn-danger btn-sm" onclick="openRejectModal('${u._id}')">✕ Reject</button>
        </div>` : u.status === 'rejected' ? `
        <div class="user-card-actions">
          <button class="btn btn-success btn-sm" onclick="approveUser('${u._id}')">↩ Approve</button>
        </div>` : ''}
    </div>`).join('');
};

const renderOvReg = (users) => {
  const el = document.getElementById('ov-reg-list');
  el.innerHTML = users.length
    ? users.map(u => `
        <div class="mini-row">
          <div style="min-width:0;">
            <div style="font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${u.firstName} ${u.lastName}</div>
            <div style="font-size:12px;color:var(--gray-400);">${fmtDate(u.createdAt)}</div>
          </div>
          <button class="btn btn-success btn-sm" onclick="approveUser('${u._id}')">Approve</button>
        </div>`).join('')
    : `<div style="padding:20px;text-align:center;color:var(--gray-400);font-size:13px;">No pending registrations.</div>`;
};

window.approveUser = async (id) => {
  try {
    await apiFetch(`/admin/users/${id}/approve`, { method: 'PATCH' });
    toast('User approved!', 'success');
    loadAll();
  } catch (err) { toast(err.message, 'error'); }
};

window.openRejectModal = (id) => {
  document.getElementById('reject-user-id').value = id;
  document.getElementById('reject-reason').value = '';
  openModal('reject-modal');
};

window.confirmReject = async () => {
  const id = document.getElementById('reject-user-id').value;
  const reason = document.getElementById('reject-reason').value.trim();
  const btn = document.getElementById('reject-confirm-btn');
  if (!reason) { toast('Please provide a reason.', 'error'); return; }
  setLoading(btn, true, 'Rejecting...');
  try {
    await apiFetch(`/admin/users/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason }) });
    toast('Registration rejected.', 'info');
    closeModal('reject-modal');
    loadAll();
  } catch (err) { toast(err.message, 'error'); setLoading(btn, false); }
};

// ── RESIDENTS ──
const loadResidents = async () => {
  try {
    const users = await apiFetch('/admin/users?role=resident&status=approved');
    const tbody = document.getElementById('residents-tbody');
    if (!users.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="icon">👥</div><p>No approved residents.</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = users.map(u => `
      <tr>
        <td><strong>${u.firstName} ${u.lastName}</strong></td>
        <td style="font-size:13px;">${u.email}</td>
        <td style="font-size:13px;">${u.phone}</td>
        <td>${badgeHtml(u.status)}</td>
        <td style="font-size:12px;color:var(--gray-400);">${fmtDate(u.createdAt)}</td>
      </tr>`).join('');
  } catch {}
};

// ── APPOINTMENTS ──
const loadAppts = async () => {
  try {
    allAppts = await apiFetch('/admin/appointments');
    filterAdminAppts();
    renderOvAppts(allAppts.filter(a => a.status === 'pending').slice(0, 5));
  } catch {}
};

window.filterAdminAppts = () => {
  const val = document.getElementById('appt-filter')?.value;
  const list = val ? allAppts.filter(a => a.status === val) : allAppts;
  if (isDesktop()) {
    document.getElementById('appts-mobile').style.display  = 'none';
    document.getElementById('appts-desktop').style.display = 'block';
    renderApptTable(list);
  } else {
    document.getElementById('appts-mobile').style.display  = 'block';
    document.getElementById('appts-desktop').style.display = 'none';
    renderApptCards(list);
  }
};

window.addEventListener('resize', filterAdminAppts);

const renderApptCards = (list) => {
  const el = document.getElementById('appts-mobile');
  if (!list.length) { el.innerHTML = `<div class="empty-state"><div class="icon">📅</div><p>No appointments found.</p></div>`; return; }
  el.innerHTML = list.map(a => `
    <div class="appt-card">
      <div class="appt-card-top">
        <span class="appt-doc-type">${a.documentType}</span>
        ${badgeHtml(a.status)}
      </div>
      <div class="appt-purpose">${a.purpose}</div>
      <div class="appt-row">👤 <strong>${a.resident?.firstName} ${a.resident?.lastName}</strong></div>
      <div class="appt-row">📅 ${fmtDate(a.preferredDate)} · ${a.preferredTime}</div>
      ${a.status === 'rescheduled' && a.rescheduledDate
        ? `<div class="appt-reschedule">↩️ ${fmtDate(a.rescheduledDate)} at ${a.rescheduledTime}</div>` : ''}
      ${a.adminRemarks ? `<div class="appt-remark">💬 ${a.adminRemarks}</div>` : ''}
      <div class="appt-meta">Submitted ${fmtDate(a.createdAt)}</div>
      <button class="btn btn-primary btn-sm btn-full" style="margin-top:8px;" onclick="openApptAction('${a._id}')">Manage</button>
    </div>`).join('');
};

const renderApptTable = (list) => {
  const tbody = document.getElementById('appts-tbody');
  if (!list.length) { tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="icon">📅</div><p>No appointments.</p></div></td></tr>`; return; }
  tbody.innerHTML = list.map(a => `
    <tr>
      <td>
        <strong>${a.resident?.firstName} ${a.resident?.lastName}</strong>
        <div style="font-size:12px;color:var(--gray-400);">${a.resident?.phone}</div>
      </td>
      <td style="font-weight:600;">${a.documentType}</td>
      <td style="font-size:13px;">${fmtDate(a.preferredDate)} · ${a.preferredTime}
        ${a.status==='rescheduled'&&a.rescheduledDate?`<br><span style="color:var(--info);font-size:12px;">↩ ${fmtDate(a.rescheduledDate)} · ${a.rescheduledTime}</span>`:''}
      </td>
      <td>${badgeHtml(a.status)}</td>
      <td><button class="btn btn-sm btn-primary" onclick="openApptAction('${a._id}')">Manage</button></td>
    </tr>`).join('');
};

const renderOvAppts = (list) => {
  const el = document.getElementById('ov-appt-list');
  el.innerHTML = list.length
    ? list.map(a => `
        <div class="mini-row">
          <div style="min-width:0;">
            <div style="font-weight:600;font-size:14px;">${a.documentType}</div>
            <div style="font-size:12px;color:var(--gray-400);">${a.resident?.firstName} ${a.resident?.lastName} · ${fmtDate(a.preferredDate)}</div>
          </div>
          <button class="btn btn-sm btn-primary" onclick="openApptAction('${a._id}')">Manage</button>
        </div>`).join('')
    : `<div style="padding:20px;text-align:center;color:var(--gray-400);font-size:13px;">No pending appointments.</div>`;
};

window.openApptAction = (id) => {
  const a = allAppts.find(x => x._id === id);
  if (!a) return;
  document.getElementById('action-appt-id').value   = id;
  document.getElementById('action-status').value    = a.status;
  document.getElementById('action-remarks').value   = a.adminRemarks || '';
  document.getElementById('resched-date').value     = '';
  document.getElementById('resched-time').value     = '';
  document.getElementById('appt-detail').innerHTML = `
    <div class="detail-item"><span class="detail-label">Document</span><span class="detail-value">${a.documentType}</span></div>
    <div class="detail-item"><span class="detail-label">Resident</span><span class="detail-value">${a.resident?.firstName} ${a.resident?.lastName}</span></div>
    <div class="detail-item"><span class="detail-label">Date</span><span class="detail-value">${fmtDate(a.preferredDate)}</span></div>
    <div class="detail-item"><span class="detail-label">Time</span><span class="detail-value">${a.preferredTime}</span></div>
    <div class="detail-item" style="grid-column:1/-1;"><span class="detail-label">Purpose</span><span class="detail-value" style="font-weight:400;font-size:13px;">${a.purpose}</span></div>`;
  toggleReschedFields();
  openModal('appt-action-modal');
};

window.toggleReschedFields = () => {
  const s = document.getElementById('action-status')?.value;
  document.getElementById('resched-fields').style.display = s === 'rescheduled' ? 'block' : 'none';
};

window.submitAction = async () => {
  const id      = document.getElementById('action-appt-id').value;
  const status  = document.getElementById('action-status').value;
  const remarks = document.getElementById('action-remarks').value.trim();
  const rDate   = document.getElementById('resched-date').value;
  const rTime   = document.getElementById('resched-time').value;
  const btn     = document.getElementById('action-submit-btn');

  if (status === 'rescheduled' && (!rDate || !rTime)) {
    toast('Please provide new date and time.', 'error'); return;
  }
  setLoading(btn, true, 'Updating...');
  try {
    await apiFetch(`/admin/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminRemarks: remarks, rescheduledDate: rDate, rescheduledTime: rTime }),
    });
    toast('Appointment updated!', 'success');
    closeModal('appt-action-modal');
    loadAll();
  } catch (err) { toast(err.message, 'error'); setLoading(btn, false); }
};

// ── Modal backdrop ──
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', (e) => { if (e.target === o) o.classList.remove('active'); });
});

loadAll();
