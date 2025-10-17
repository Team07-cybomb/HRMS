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
    },
    employeeEmail: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Annual Leave", "Sick Leave", "Personal Leave", "Unpaid Leave"],
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

// Index for better query performance
leaveSchema.index({ employeeId: 1, status: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model("Leave", leaveSchema);
