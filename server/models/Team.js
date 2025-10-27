// models/Team.js
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lead: { type: String, required: true }, // This will store employeeId like "EMPID003"
  department: { type: String, required: true },
  location: { type: String, required: true },
  budget: { type: String, default: '' },
  status: { type: String, default: 'active' },
  members: [{ type: String }], // Array of employee IDs like "EMPID003", "EMPID004"
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Team', teamSchema);