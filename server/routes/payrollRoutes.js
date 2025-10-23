const express = require("express");
const router = express.Router();
const {
  getEmployeesWithSalary,
  runPayroll,
  getPayrollHistory,
  getPayrollByMonth,
  updateEmployeeSalary,
  getEmployeeSalaryHistory,
  generatePayslip,
} = require("../controllers/payrollController");

// Get all employees with salary information
router.get("/employees", getEmployeesWithSalary);

// Run payroll for a specific month
router.post("/run", runPayroll);

// Get payroll history
router.get("/history", getPayrollHistory);

// Get payroll details for specific month
router.get("/month/:month/:year", getPayrollByMonth);

// Update employee salary
router.post("/salary", updateEmployeeSalary);

// Get employee salary history
router.get("/salary-history/:employeeId", getEmployeeSalaryHistory);

// Generate payslip
router.get("/payslip/:payrollId", generatePayslip);

module.exports = router;
