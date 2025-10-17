// models/EmployeeShift.js
const mongoose = require('mongoose');

const employeeShiftSchema = new mongoose.Schema({
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true, 
    ref: 'Employee'  // ✅ Change from 'User' to 'Employee'
  },
  employeeName: {
    type: String,
    required: true
  },
  shiftId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'Shift' 
  },
  shiftName: {
    type: String,
    required: true
  },
  effectiveDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  assignedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  assignedByName: {
    type: String,
    required: true
  },
  teamId: {
    type: Number,
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Compound index for active assignments
employeeShiftSchema.index({ 
  employeeId: 1, 
  isActive: 1 
});

// Index for effective date queries
employeeShiftSchema.index({ 
  effectiveDate: 1 
});

// Pre-save middleware
employeeShiftSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to deactivate assignment
employeeShiftSchema.methods.deactivate = function() {
  this.isActive = false;
  this.endDate = new Date();
  return this.save();
};

// Static method to find active assignments
employeeShiftSchema.statics.findActiveAssignments = function() {
  return this.find({ isActive: true })
    .populate('shiftId')
    .sort({ employeeName: 1 });
};

// Static method to find assignments by employee
employeeShiftSchema.statics.findByEmployee = function(employeeId) {
  return this.find({ employeeId })
    .populate('shiftId')
    .sort({ effectiveDate: -1 });
};

// Static method to find current assignment
employeeShiftSchema.statics.findCurrentAssignment = function(employeeId) {
  return this.findOne({ 
    employeeId, 
    isActive: true 
  }).populate('shiftId');
};

module.exports = mongoose.model('EmployeeShift', employeeShiftSchema);