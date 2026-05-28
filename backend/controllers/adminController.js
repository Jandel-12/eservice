const User = require('../models/User');
const Appointment = require('../models/Appointment');

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { status, role } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// PATCH /api/admin/users/:id/approve
const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.status = 'approved';
    user.rejectionReason = '';
    await user.save();
    res.json({ message: 'User approved.', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// PATCH /api/admin/users/:id/reject
const rejectUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.status = 'rejected';
    user.rejectionReason = reason || 'No reason provided.';
    await user.save();
    res.json({ message: 'User rejected.', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// GET /api/admin/appointments
const getAllAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const appts = await Appointment.find(filter)
      .populate('resident', 'firstName lastName email phone address')
      .populate('processedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(appts);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// PATCH /api/admin/appointments/:id
const updateAppointment = async (req, res) => {
  try {
    const { status, adminRemarks, rescheduledDate, rescheduledTime } = req.body;
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found.' });
    appt.status = status || appt.status;
    appt.adminRemarks = adminRemarks !== undefined ? adminRemarks : appt.adminRemarks;
    appt.processedBy = req.user._id;
    appt.processedAt = new Date();
    if (status === 'rescheduled') {
      appt.rescheduledDate = rescheduledDate || appt.rescheduledDate;
      appt.rescheduledTime = rescheduledTime || appt.rescheduledTime;
    }
    await appt.save();
    res.json({ message: 'Appointment updated.', appt });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const [totalResidents, pendingRegistrations, totalAppts, pendingAppts, approvedAppts] = await Promise.all([
      User.countDocuments({ role: 'resident', status: 'approved' }),
      User.countDocuments({ role: 'resident', status: 'pending' }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'approved' }),
    ]);
    res.json({ totalResidents, pendingRegistrations, totalAppts, pendingAppts, approvedAppts });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { getAllUsers, approveUser, rejectUser, getAllAppointments, updateAppointment, getDashboardStats };
