const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, ref: 'User', unique: true },
  annual: { type: Number, default: 20 },
  casual: { type: Number, default: 12 },
  sick: { type: Number, default: 10 },
  maternity: { type: Number, default: 180 },
  paternity: { type: Number, default: 7 },
  unpaid: { type: Number, default: 0 },
  year: { type: Number, default: () => new Date().getFullYear() },
  carriedOver: { 
    annual: { type: Number, default: 0 },
    casual: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index for employee and year
leaveBalanceSchema.index({ employeeId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);