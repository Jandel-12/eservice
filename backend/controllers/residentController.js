const Appointment = require('../models/Appointment');

// POST /api/resident/appointments
const createAppointment = async (req, res) => {
  try {
    const { documentType, purpose, preferredDate, preferredTime, occupation, civilStatus, monthlyIncome } = req.body;

    if (!documentType || !purpose || !preferredDate || !preferredTime) {
      return res.status(400).json({ message: 'Document type, purpose, date, and time are required.' });
    }

    const appt = await Appointment.create({
      resident: req.user._id,
      documentType, purpose, preferredDate, preferredTime,
      occupation: occupation || '',
      civilStatus: civilStatus || '',
      monthlyIncome: monthlyIncome || '',
    });

    res.status(201).json({ message: 'Appointment scheduled successfully.', appt });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// GET /api/resident/appointments
const getMyAppointments = async (req, res) => {
  try {
    const appts = await Appointment.find({ resident: req.user._id }).sort({ createdAt: -1 });
    res.json(appts);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { createAppointment, getMyAppointments };
