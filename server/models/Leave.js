const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: String,
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
      index: true,
    },
    employeeEmail: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Annual Leave", "Sick Leave", "Personal Leave"],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    approver: {
      type: String,
      required: true,
    },
    approverId: {
      type: String,
    },
    approvedDate: {
      type: Date,
    },
    rejectedDate: {
      type: Date,
    },
    approvedBy: {
      type: String,
    },
    rejectedBy: {
      type: String,
    },
    cancelledDate: {
      type: Date,
    },
    cancelledBy: {
      type: String,
    },
    days: {
      type: Number,
      required: true,
    },
    tenantId: {
      type: String,
      default: "TENANT01",
    },
  },
  {
    timestamps: true,
  }
);

// Leave balance schema
const leaveBalanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    employeeEmail: {
      type: String,
      required: true,
    },
    annualLeave: {
      type: Number,
      default: 6,
      min: 0,
    },
    sickLeave: {
      type: Number,
      default: 6,
      min: 0,
    },
    personalLeave: {
      type: Number,
      default: 6,
      min: 0,
    },
    lastResetDate: {
      type: Date,
      default: Date.now,
    },
    tenantId: {
      type: String,
      default: "TENANT01",
    },
  },
  {
    timestamps: true,
  }
);

// Leave settings schema for global configuration
const leaveSettingsSchema = new mongoose.Schema(
  {
    annualLeaveLimit: {
      type: Number,
      default: 6,
      min: 0,
    },
    sickLeaveLimit: {
      type: Number,
      default: 6,
      min: 0,
    },
    personalLeaveLimit: {
      type: Number,
      default: 6,
      min: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: String,
      default: "System",
    },
    tenantId: {
      type: String,
      default: "TENANT01",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
leaveSchema.index({ employeeId: 1, status: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });
leaveBalanceSchema.index({ employeeId: 1 });
leaveSettingsSchema.index({ tenantId: 1 });

const Leave = mongoose.model("Leave", leaveSchema);
const LeaveBalance = mongoose.model("LeaveBalance", leaveBalanceSchema);
const LeaveSettings = mongoose.model("LeaveSettings", leaveSettingsSchema);

module.exports = { Leave, LeaveBalance, LeaveSettings };
