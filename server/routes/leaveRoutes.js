const express = require("express");
const router = express.Router();
const {
  getAllLeaves,
  getLeavesByEmployee,
  createLeave,
  updateLeaveStatus,
  deleteLeave,
} = require("../controllers/leaveController");

// Get all leave requests
router.get("/", getAllLeaves);

// Get leave requests by employee ID
router.get("/employee/:employeeId", getLeavesByEmployee);

// Create new leave request
router.post("/", createLeave);

// Update leave status
router.patch("/:id/status", updateLeaveStatus);

// Delete leave request
router.delete("/:id", deleteLeave);

module.exports = router;
