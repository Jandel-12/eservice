const mongoose = require('mongoose');

const documentRequestSchema = new mongoose.Schema({
  resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  documentType: {
    type: String,
    enum: ['Barangay Clearance', 'Barangay Residency', 'Barangay Certification', 'Barangay Indigency', 'Cedula'],
    required: true
  },
  purpose: { type: String, required: true, trim: true },
  status: { type: String, enum: ['pending', 'processing', 'approved', 'rejected'], default: 'pending' },
  remarks: { type: String, default: '' },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  processedAt: { type: Date, default: null },

  // Extra fields for Cedula
  occupation: { type: String, default: '' },
  civilStatus: { type: String, default: '' },
  monthlyIncome: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('DocumentRequest', documentRequestSchema);
