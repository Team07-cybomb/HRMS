const express = require("express");
const router = express.Router();
const {
  getAllLeaves,
  getLeavesByEmployee,
  getPendingLeavesForApprover,
  createLeave,
  updateLeaveStatus,
  deleteLeave,
  getLeaveBalance,
  resetAllLeaveBalances,
  getAllLeaveBalances,
  getEmployeeIdByEmail, // Add this import
} = require("../controllers/leaveController");

// Get all leave requests
router.get("/", getAllLeaves);

// Get all leave balances
router.get("/balances", getAllLeaveBalances);

// Get employee ID by email
router.get("/employee/email/:email", getEmployeeIdByEmail);

// Get leave requests by employee ID
router.get("/employee/:employeeId", getLeavesByEmployee);

// Get pending leaves for approver
router.get("/approver/:approverId", getPendingLeavesForApprover);

// Get leave balance for employee
router.get("/balance/:employeeId", getLeaveBalance);

// Create new leave request
router.post("/", createLeave);

// Update leave status
router.patch("/:id/status", updateLeaveStatus);

// Delete leave request
router.delete("/:id", deleteLeave);

// Reset all leave balances (admin only)
router.post("/reset-balances", resetAllLeaveBalances);

module.exports = router;
