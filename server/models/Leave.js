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
      enum: ["pending", "approved", "rejected", "hold"],
      default: "pending",
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    approver: {
      type: String,
      default: "HR/Admin",
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

module.exports = mongoose.model("Leave", leaveSchema);
