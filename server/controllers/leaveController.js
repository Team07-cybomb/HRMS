const Leave = require("../models/Leave");

// Get all leave requests
const getAllLeaves = async (req, res) => {
  try {
    const { status, employeeId } = req.query;

    let filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }
    if (employeeId) {
      filter.employeeId = employeeId;
    }

    const leaves = await Leave.find(filter).sort({ createdAt: -1 });
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

    const leaves = await Leave.find({
      employeeId: employeeId,
      status: { $ne: "cancelled" },
    }).sort({ createdAt: -1 });

    console.log("Found leaves:", leaves.length);
    res.json(leaves);
  } catch (error) {
    console.error("Error in getLeavesByEmployee:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get pending leaves for approver
const getPendingLeavesForApprover = async (req, res) => {
  try {
    const { approverId } = req.params;

    if (!approverId) {
      return res.status(400).json({ message: "Approver ID is required" });
    }

    const leaves = await Leave.find({
      approverId: approverId,
      status: "pending",
    }).sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error("Error in getPendingLeavesForApprover:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create new leave request
const createLeave = async (req, res) => {
  try {
    const {
      employee,
      employeeId,
      employeeEmail,
      type,
      startDate,
      endDate,
      reason,
      approver,
      approverId,
    } = req.body;

    console.log("Received leave request data:", req.body);

    // Validate required fields
    if (
      !employee ||
      !employeeId ||
      !employeeEmail ||
      !type ||
      !startDate ||
      !endDate ||
      !reason
    ) {
      return res.status(400).json({
        message: "Missing required fields",
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

    // Calculate number of days
    const timeDiff = end.getTime() - start.getTime();
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;

    const leave = new Leave({
      employee,
      employeeId,
      employeeEmail,
      type,
      startDate: start,
      endDate: end,
      reason,
      approver: approver || "HR Manager",
      approverId: approverId || "HR001",
      days,
      status: "pending",
    });

    const savedLeave = await leave.save();
    console.log("Leave saved to database successfully:", savedLeave);

    res.status(201).json(savedLeave);
  } catch (error) {
    console.error("Error creating leave:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update leave status
const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy, rejectedBy, actionBy } = req.body;

    console.log("Updating leave status:", id, status, actionBy);

    if (!["approved", "rejected", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updateData = { status };
    const now = new Date();

    if (status === "approved") {
      updateData.approvedDate = now;
      updateData.approvedBy = approvedBy || actionBy;
      updateData.rejectedDate = null;
      updateData.rejectedBy = null;
    } else if (status === "rejected") {
      updateData.rejectedDate = now;
      updateData.rejectedBy = rejectedBy || actionBy;
      updateData.approvedDate = null;
      updateData.approvedBy = null;
    } else if (status === "cancelled") {
      updateData.cancelledDate = now;
      updateData.cancelledBy = actionBy;
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
  getPendingLeavesForApprover,
  createLeave,
  updateLeaveStatus,
  deleteLeave,
};
