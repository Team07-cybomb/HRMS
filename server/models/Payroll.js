const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, ref: 'User' },
  employee: { type: String, required: true },
  period: { type: String, required: true }, // "Jan 2024"
  basicSalary: { type: Number, required: true },
  allowances: {
    housing: { type: Number, default: 0 },
    transportation: { type: Number, default: 0 },
    medical: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 }
  },
  deductions: {
    tax: { type: Number, default: 0 },
    insurance: { type: Number, default: 0 },
    loan: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  overtime: { type: Number, default: 0 },
  attendanceBonus: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'processed', 'paid', 'cancelled'],
    default: 'draft'
  },
  paymentDate: Date,
  paymentMethod: { 
    type: String, 
    enum: ['bank_transfer', 'cash', 'cheque'],
    default: 'bank_transfer'
  },
  teamId: { type: Number },
  processedBy: { type: String, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index for employee and period
payrollSchema.index({ employeeId: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);