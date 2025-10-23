const mongoose = require("mongoose");

const employeeSalarySchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      ref: "Employee",
    },
    basicSalary: {
      type: Number,
      required: true,
      default: 0,
    },
    allowances: {
      type: Number,
      required: true,
      default: 0,
    },
    deductions: {
      type: Number,
      required: true,
      default: 0,
    },
    effectiveFrom: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("EmployeeSalary", employeeSalarySchema);
