const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  documentType: {
    type: String,
    enum: ['Barangay Clearance', 'Barangay Residency', 'Barangay Certification', 'Barangay Indigency', 'Cedula'],
    required: true,
  },
  purpose:       { type: String, required: true, trim: true },
  occupation:    { type: String, default: '' },
  civilStatus:   { type: String, default: '' },
  monthlyIncome: { type: String, default: '' },

  preferredDate: { type: Date, required: true },
  preferredTime: { type: String, required: true },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rescheduled', 'rejected', 'completed'],
    default: 'pending',
  },
  adminRemarks:    { type: String, default: '' },
  rescheduledDate: { type: Date, default: null },
  rescheduledTime: { type: String, default: '' },
  processedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  processedAt:     { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
