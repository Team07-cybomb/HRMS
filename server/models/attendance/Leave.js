const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, ref: 'User' },
  employee: { type: String, required: true },
  leaveType: { 
    type: String, 
    enum: ['sick', 'casual', 'annual', 'maternity', 'paternity', 'unpaid'],
    required: true
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalDays: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  approver: { type: String, ref: 'User' },
  teamId: { type: Number },
  appliedDate: { type: Date, default: Date.now },
  approvedDate: Date,
  rejectionReason: String,
  documents: [String], // Array of file paths or base64 strings
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Leave', leaveSchema);