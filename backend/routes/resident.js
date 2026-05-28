const express = require('express');
const router = express.Router();
const { protect, approvedOnly } = require('../middleware/auth');
const { createAppointment, getMyAppointments } = require('../controllers/residentController');

router.use(protect, approvedOnly);
router.post('/appointments', createAppointment);
router.get('/appointments', getMyAppointments);

module.exports = router;
