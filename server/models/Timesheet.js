// models/Timesheet.js - Simplified version
const mongoose = require('mongoose');

const timesheetSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  employee: { type: String, required: true },
  period: { type: String, required: true },
  totalHours: { type: Number, required: true },
  approver: { type: String },
  teamId: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'submitted', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Timesheet', timesheetSchema);