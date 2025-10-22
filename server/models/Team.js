const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lead: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  budget: { type: String, default: '' },
  status: { type: String, default: 'active' },
  members: [{ type: String }], // Array of employee IDs
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Team', teamSchema);