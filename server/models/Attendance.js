const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
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
  checkInPhoto: { type: String }, // Base64 encoded image or file path
  checkOutPhoto: { type: String }, // Base64 encoded image or file path
  status: { 
    type: String, 
    enum: ['present', 'absent', 'late', 'half-day'],
    default: 'absent'
  },
  shift: { type: String, default: 'Day Shift' },
  location: { type: String, default: 'Office' },
  duration: { type: String, default: '0h 0m' },
  teamId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Compound index to ensure one attendance record per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);