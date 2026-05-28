const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAllUsers, approveUser, rejectUser,
  getAllAppointments, updateAppointment,
  getDashboardStats
} = require('../controllers/adminController');

router.use(protect, adminOnly);
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/approve', approveUser);
router.patch('/users/:id/reject', rejectUser);
router.get('/appointments', getAllAppointments);
router.patch('/appointments/:id', updateAppointment);

module.exports = router;
