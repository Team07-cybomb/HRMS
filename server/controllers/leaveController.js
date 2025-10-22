const { Leave, LeaveBalance } = require("../models/Leave");
const Employee = require("../models/Employee"); // Add this import

// Initialize leave balance for employee
const initializeLeaveBalance = async (employeeId, employeeEmail) => {
  try {
    const existingBalance = await LeaveBalance.findOne({ employeeId });
    if (!existingBalance) {
      const newBalance = new LeaveBalance({
        employeeId,
        employeeEmail,
        annualLeave: 6,
        sickLeave: 6,
        personalLeave: 6,
      });
      await newBalance.save();
      console.log("Initialized leave balance for employee:", employeeId);
      return newBalance;
    }
    return existingBalance;
  } catch (error) {
    console.error("Error initializing leave balance:", error);
    throw error;
  }
};

// Get all leave balances
const getAllLeaveBalances = async (req, res) => {
  try {
    // First, get all employees to ensure we have balances for everyone
    const employees = await Employee.find({});

    // Get existing balances
    const balances = await LeaveBalance.find({});

    // Convert to object format and ensure all employees have balances
    const balancesObj = {};

    // Initialize balances for all employees
    employees.forEach((employee) => {
      const existingBalance = balances.find(
        (b) => b.employeeId === employee.employeeId
      );
      if (existingBalance) {
        balancesObj[employee.employeeId] = {
          annualLeave: existingBalance.annualLeave,
          sickLeave: existingBalance.sickLeave,
          personalLeave: existingBalance.personalLeave,
          employeeName: employee.name,
          employeeEmail: employee.email,
          employeeId: employee.employeeId,
          lastResetDate: existingBalance.lastResetDate,
        };
      } else {
        // Create default balance for employees without one
        balancesObj[employee.employeeId] = {
          annualLeave: 6,
          sickLeave: 6,
          personalLeave: 6,
          employeeName: employee.name,
          employeeEmail: employee.email,
          employeeId: employee.employeeId,
          lastResetDate: new Date(),
        };
      }
    });

    res.json(balancesObj);
  } catch (error) {
    console.error("Error getting all leave balances:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get leave balance for employee
const getLeaveBalance = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    // Verify employee exists
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    let balance = await LeaveBalance.findOne({ employeeId });

    if (!balance) {
      // Initialize balance if not exists
      balance = await initializeLeaveBalance(employeeId, employee.email);
    }

    // Enhance balance with employee data
    const enhancedBalance = {
      ...balance.toObject(),
      employeeName: employee.name,
      employeeEmail: employee.email,
    };

    res.json(enhancedBalance);
  } catch (error) {
    console.error("Error getting leave balance:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update leave balance
const updateLeaveBalance = async (
  employeeId,
  leaveType,
  days,
  operation = "deduct"
) => {
  try {
    const balance = await LeaveBalance.findOne({ employeeId });
    if (!balance) {
      throw new Error("Leave balance not found for employee");
    }

    const fieldMap = {
      "Annual Leave": "annualLeave",
      "Sick Leave": "sickLeave",
      "Personal Leave": "personalLeave",
    };

    const field = fieldMap[leaveType];
    if (!field) {
      throw new Error("Invalid leave type");
    }

    if (operation === "deduct") {
      if (balance[field] < days) {
        throw new Error(
          `Insufficient ${leaveType} balance. Available: ${balance[field]} days, Requested: ${days} days`
        );
      }
      balance[field] -= days;
    } else if (operation === "add") {
      balance[field] += days;
      // Ensure balance doesn't exceed maximum
      if (balance[field] > 6) {
        balance[field] = 6;
      }
    }

    await balance.save();
    console.log(
      `Updated ${leaveType} balance for ${employeeId}: ${balance[field]} days`
    );
    return balance;
  } catch (error) {
    console.error("Error updating leave balance:", error);
    throw error;
  }
};

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

    // Enhance leaves with employee data
    const enhancedLeaves = await Promise.all(
      leaves.map(async (leave) => {
        const employee = await Employee.findOne({
          employeeId: leave.employeeId,
        });
        return {
          ...leave.toObject(),
          employeeName: employee?.name || leave.employee,
          employeeEmail: employee?.email || leave.employeeEmail,
        };
      })
    );

    res.json(enhancedLeaves);
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

    // Verify employee exists
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    console.log("Fetching leaves for employee ID:", employeeId);

    const leaves = await Leave.find({
      employeeId: employeeId,
    }).sort({ createdAt: -1 });

    console.log("Found leaves:", leaves.length);
    res.json(leaves);
  } catch (error) {
    console.error("Error in getLeavesByEmployee:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get employee ID by email
const getEmployeeIdByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
    });
  } catch (error) {
    console.error("Error getting employee by email:", error);
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
      employeeId, // Now expecting employeeId from frontend
      type,
      startDate,
      endDate,
      reason,
      approver,
      approverId,
    } = req.body;

    console.log("Received leave request data:", req.body);

    // Validate required fields
    if (!employeeId || !type || !startDate || !endDate || !reason) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // Get employee data from Employee collection
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
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

    // Check leave balance for paid leaves - ONLY CHECK, DON'T DEDUCT
    let balance = await LeaveBalance.findOne({ employeeId });
    if (!balance) {
      balance = await initializeLeaveBalance(employeeId, employee.email);
    }

    const fieldMap = {
      "Annual Leave": "annualLeave",
      "Sick Leave": "sickLeave",
      "Personal Leave": "personalLeave",
    };

    const field = fieldMap[type];
    if (balance[field] < days) {
      return res.status(400).json({
        message: `Insufficient ${type} balance. Available: ${balance[field]} days, Requested: ${days} days`,
      });
    }

    const leave = new Leave({
      employee: employee.name, // Use name from Employee collection
      employeeId,
      employeeEmail: employee.email, // Use email from Employee collection
      type,
      startDate: start,
      endDate: end,
      reason,
      approver: approver || "HR Manager",
      approverId: approverId || "HR001",
      days,
      status: "pending", // IMPORTANT: Always set to pending for new requests
    });

    const savedLeave = await leave.save();
    console.log("Leave saved to database with PENDING status:", savedLeave);

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

    // Get the current leave request
    const currentLeave = await Leave.findById(id);
    if (!currentLeave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    const updateData = { status };
    const now = new Date();

    if (status === "approved") {
      updateData.approvedDate = now;
      updateData.approvedBy = approvedBy || actionBy;
      updateData.rejectedDate = null;
      updateData.rejectedBy = null;

      // DEDUCT LEAVE BALANCE ONLY WHEN APPROVED (for paid leaves)
      await updateLeaveBalance(
        currentLeave.employeeId,
        currentLeave.type,
        currentLeave.days,
        "deduct"
      );
    } else if (status === "rejected") {
      updateData.rejectedDate = now;
      updateData.rejectedBy = rejectedBy || actionBy;
      updateData.approvedDate = null;
      updateData.approvedBy = null;

      // No need to deduct balance for rejected leaves
    } else if (status === "cancelled") {
      updateData.cancelledDate = now;
      updateData.cancelledBy = actionBy;

      // If cancelled and was approved, return the deducted leave days
      if (currentLeave.status === "approved") {
        await updateLeaveBalance(
          currentLeave.employeeId,
          currentLeave.type,
          currentLeave.days,
          "add"
        );
      }
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
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // If the leave was approved, return the deducted days
    if (leave.status === "approved") {
      await updateLeaveBalance(leave.employeeId, leave.type, leave.days, "add");
    }

    await Leave.findByIdAndDelete(req.params.id);

    res.json({ message: "Leave request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset all leave balances (admin function)
const resetAllLeaveBalances = async (req, res) => {
  try {
    // Get all employees to ensure we reset balances for everyone
    const employees = await Employee.find({});

    // Update or create balances for all employees
    await Promise.all(
      employees.map(async (employee) => {
        await LeaveBalance.findOneAndUpdate(
          { employeeId: employee.employeeId },
          {
            $set: {
              annualLeave: 6,
              sickLeave: 6,
              personalLeave: 6,
              employeeEmail: employee.email,
              lastResetDate: new Date(),
            },
          },
          { upsert: true, new: true }
        );
      })
    );

    res.json({ message: "All leave balances reset successfully" });
  } catch (error) {
    console.error("Error resetting leave balances:", error);
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
  getLeaveBalance,
  updateLeaveBalance,
  resetAllLeaveBalances,
  initializeLeaveBalance,
  getAllLeaveBalances,
  getEmployeeIdByEmail, // Add this new function
};
