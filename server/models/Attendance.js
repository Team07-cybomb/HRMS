// models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { 
    type: String,  // Change to String to store EMP003
    required: true,
    ref: 'Employee'
  },
  employee: { type: String, required: true },
  date: { type: Date, required: true },
  checkIn: { type: String },
  checkOut: { type: String },
  checkInLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
    accuracy: Number
  },
  checkOutLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
    accuracy: Number
  },
  checkInPhoto: { type: String },
  checkOutPhoto: { type: String },
  status: { 
    type: String, 
    enum: ['present', 'absent', 'late', 'half-day'],
    default: 'absent'
  },
  shift: { type: String, default: 'Day Shift' },
  location: { type: String, default: 'Office' },
  duration: { type: String, default: '0h 0m' },
  teamId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
    isLate: {
    type: Boolean,
    default: false
  },
  lateMinutes: {
    type: Number,
    default: 0
  },
  workingMinutes: {
    type: Number,
    default: 0
  },
  totalMinutes: {
    type: Number,
    default: 0
  },
  breakDuration: {
    type: Number,
    default: 60 // minutes
  }
});

// Compound index to ensure one attendance record per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);