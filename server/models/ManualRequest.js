// models/ManualRequest.js
const mongoose = require('mongoose');

const manualRequestSchema = new mongoose.Schema({
  employeeId: { 
    type: String, 
    required: true, 
    ref: 'User' 
  },
  employee: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  requestedIn: { 
    type: String, 
    required: true 
  },
  requestedOut: { 
    type: String, 
    required: true 
  },
  reason: { 
    type: String, 
    required: true,
    trim: true
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approver: { 
    type: String, 
    ref: 'User' 
  },
  teamId: { 
    type: Number, 
    required: true 
  },
  approvedDate: Date,
  rejectionReason: String,
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Compound index to prevent duplicate requests for same employee and date
manualRequestSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// Index for efficient querying by status and team
manualRequestSchema.index({ status: 1 });
manualRequestSchema.index({ teamId: 1 });
manualRequestSchema.index({ createdAt: -1 });

// Pre-save middleware to update updatedAt
manualRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find pending requests
manualRequestSchema.statics.findPending = function() {
  return this.find({ status: 'pending' }).sort({ createdAt: -1 });
};

// Static method to find by employee
manualRequestSchema.statics.findByEmployee = function(employeeId) {
  return this.find({ employeeId }).sort({ date: -1 });
};

// Instance method to approve request
manualRequestSchema.methods.approve = function(approverId) {
  this.status = 'approved';
  this.approver = approverId;
  this.approvedDate = new Date();
  return this.save();
};

// Instance method to reject request
manualRequestSchema.methods.reject = function(approverId, reason) {
  this.status = 'rejected';
  this.approver = approverId;
  this.rejectionReason = reason;
  return this.save();
};

// Virtual for formatted date
manualRequestSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Ensure virtual fields are serialized
manualRequestSchema.set('toJSON', { virtuals: true });
manualRequestSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ManualRequest', manualRequestSchema);