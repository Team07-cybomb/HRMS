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

// Get all employees with their salary info
router.get("/employees", getEmployeesWithSalary);

// Run payroll for a specific month
router.post("/run", runPayroll);

// Get payroll history (all months with payroll)
router.get("/history", getPayrollHistory);

// Get payroll details for a specific month
router.get("/month/:month/:year", getPayrollByMonth);

// Update employee salary
router.post("/salary", updateEmployeeSalary);

// Get employee salary history
router.get("/salary-history/:employeeId", getEmployeeSalaryHistory);

// Generate payslip
router.get("/payslip/:payrollId", generatePayslip);

module.exports = router;
