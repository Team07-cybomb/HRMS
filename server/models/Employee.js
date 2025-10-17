const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: String,
  designation: String,
  role: String,
  employmentType: { type: String, default: 'Permanent' },
  status: { type: String, default: 'active' },
  sourceOfHire: { type: String, default: 'Direct' },
  location: String,
  dateOfJoining: Date,
  totalExperience: String,
  password: { type: String } // Store plain text reference only
});

module.exports = mongoose.model('Employee', employeeSchema);