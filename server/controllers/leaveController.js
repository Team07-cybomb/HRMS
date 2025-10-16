const Leave = require("../models/Leave");

// Get all leave requests
const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get leave requests by employee ID
const getLeavesByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    console.log("Fetching leaves for employee ID:", employeeId);

    const leaves = await Leave.find({ employeeId: employeeId }).sort({
      createdAt: -1,
    });

    console.log("Found leaves:", leaves.length);
    res.json(leaves);
  } catch (error) {
    console.error("Error in getLeavesByEmployee:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create new leave request
const createLeave = async (req, res) => {
  try {
    const { employee, employeeId, type, startDate, endDate, reason, approver } =
      req.body;

    console.log("Received leave request data:", req.body);

    // Validate required fields
    if (
      !employee ||
      !employeeId ||
      !type ||
      !startDate ||
      !endDate ||
      !reason
    ) {
      return res.status(400).json({
        message:
          "Missing required fields: employee, employeeId, type, startDate, endDate, reason",
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (end < start) {
      return res
        .status(400)
        .json({ message: "End date cannot be before start date" });
    }

    // Calculate number of days (include both start and end dates)
    const timeDiff = end.getTime() - start.getTime();
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;

    const leave = new Leave({
      employee,
      employeeId,
      type,
      startDate: start,
      endDate: end,
      reason,
      approver: approver || "HR/Admin",
      days,
      status: "pending",
    });

    const savedLeave = await leave.save();

    console.log("Leave saved to database successfully:", savedLeave);

    res.status(201).json(savedLeave);
  } catch (error) {
    console.error("Error creating leave:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update leave status
const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy, rejectedBy } = req.body;

    console.log("Updating leave status:", id, status);

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updateData = { status };

    if (status === "approved") {
      updateData.approvedDate = new Date();
      updateData.approvedBy = approvedBy;
      updateData.rejectedDate = null;
      updateData.rejectedBy = null;
    } else if (status === "rejected") {
      updateData.rejectedDate = new Date();
      updateData.rejectedBy = rejectedBy;
      updateData.approvedDate = null;
      updateData.approvedBy = null;
    }

    const leave = await Leave.findByIdAndUpdate(id, updateData, { new: true });

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    console.log("Leave status updated successfully:", leave);
    res.json(leave);
  } catch (error) {
    console.error("Error updating leave status:", error);
    res.status(400).json({ message: error.message });
  }
};

// Delete leave request
const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    res.json({ message: "Leave request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllLeaves,
  getLeavesByEmployee,
  createLeave,
  updateLeaveStatus,
  deleteLeave,
};
