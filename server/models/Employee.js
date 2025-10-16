const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: String,
  designation: String,
  status: { type: String, default: 'active' },
  location: String
});

module.exports = mongoose.model('Employee', employeeSchema);