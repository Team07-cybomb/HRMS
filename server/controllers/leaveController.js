const { Leave, LeaveBalance, LeaveSettings } = require("../models/Leave");
const Employee = require("../models/Employee");
const Notification = require("../models/Notification");
const User = require("../models/User");

// Get or create leave settings
const getOrCreateLeaveSettings = async () => {
  try {
    let settings = await LeaveSettings.findOne({ tenantId: "TENANT01" });
    if (!settings) {
      settings = new LeaveSettings({
        annualLeaveLimit: 6,
        sickLeaveLimit: 6,
        personalLeaveLimit: 6,
        updatedBy: "System",
      });
      await settings.save();
    }
    return settings;
  } catch (error) {
    console.error("Error getting leave settings:", error);
    throw error;
  }
};

// Initialize leave balance for employee
const initializeLeaveBalance = async (employeeId, employeeEmail) => {
  try {
    // Get current leave settings
    const settings = await getOrCreateLeaveSettings();

    const existingBalance = await LeaveBalance.findOne({ employeeId });
    if (!existingBalance) {
      const newBalance = new LeaveBalance({
        employeeId,
        employeeEmail,
        annualLeave: settings.annualLeaveLimit,
        sickLeave: settings.sickLeaveLimit,
        personalLeave: settings.personalLeaveLimit,
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

// FIXED: Notification functions - COMBINE BOTH APPROACHES
const notifyLeaveApplication = async (leave) => {
  try {
    console.log(
      "🔔 Notifying admins about new leave application from:",
      leave.employeeId
    );

    // APPROACH 1: Find admin users from User collection (for admin/HR users)
    const adminUsers = await User.find({
      role: { $in: ["admin", "hr", "manager", "employer"] },
    });

    console.log(
      `📧 Found ${adminUsers.length} admin users from User collection`
    );

    // APPROACH 2: Find admin employees from Employee collection (for admin employees)
    const adminEmployees = await Employee.find({
      role: { $in: ["admin", "hr", "manager", "employer"] },
    });

    console.log(
      `👥 Found ${adminEmployees.length} admin employees from Employee collection`
    );

    // Combine both lists
    const allAdmins = [...adminUsers, ...adminEmployees];
    console.log(`🎯 Total admins to notify: ${allAdmins.length}`);

    if (allAdmins.length === 0) {
      console.log(
        "⚠️ No admin users found with roles: admin, hr, manager, employer"
      );
      return;
    }

    // Remove duplicates based on email
    const uniqueAdmins = allAdmins.reduce((acc, current) => {
      const x = acc.find((item) => item.email === current.email);
      if (!x) {
        return acc.concat([current]);
      }
      return acc;
    }, []);

    console.log(`✅ Unique admins after deduplication: ${uniqueAdmins.length}`);

    // Notify all unique admins
    const notificationPromises = uniqueAdmins.map(async (admin) => {
      let recipientId;
      let recipientEmail = admin.email;

      // For User collection admins (like admin@company.com)
      if (admin._id && !admin.employeeId) {
        recipientId = admin._id.toString(); // Use MongoDB _id for User collection
        console.log(
          `📨 Notifying User admin: ${admin.email} with ID: ${recipientId}`
        );
      }
      // For Employee collection admins
      else if (admin.employeeId) {
        recipientId = admin.employeeId; // Use employeeId for Employee collection
        console.log(
          `📨 Notifying Employee admin: ${admin.email} with ID: ${recipientId}`
        );
      }
      // Fallback
      else {
        recipientId = admin.id || admin.email;
        console.log(
          `📨 Notifying admin with fallback ID: ${admin.email} with ID: ${recipientId}`
        );
      }

      await Notification.create({
        recipientId: recipientId,
        recipientEmail: recipientEmail,
        senderId: leave.employeeId,
        senderName: leave.employee,
        type: "leave_application",
        title: "New Leave Application",
        message: `${leave.employee} (EMP ID: ${
          leave.employeeId
        }) has applied for ${leave.type} from ${new Date(
          leave.startDate
        ).toLocaleDateString()} to ${new Date(
          leave.endDate
        ).toLocaleDateString()}`,
        module: "leave",
        moduleId: leave._id,
        relatedEmployeeId: leave.employeeId,
        relatedEmployeeName: leave.employee,
        actionUrl: `/leaves/${leave._id}`,
        priority: "medium",
      });
    });

    await Promise.all(notificationPromises);
    console.log(
      `✅ Notified ${uniqueAdmins.length} admins/managers about new leave application`
    );
  } catch (error) {
    console.error("Error notifying leave application:", error);
  }
};

const notifyLeaveStatusUpdate = async (leave, oldStatus) => {
  try {
    let type, title, message;

    if (leave.status === "approved") {
      type = "leave_approved";
      title = "Leave Request Approved";
      message = `Your ${leave.type} request from ${new Date(
        leave.startDate
      ).toLocaleDateString()} to ${new Date(
        leave.endDate
      ).toLocaleDateString()} has been approved`;
    } else if (leave.status === "rejected") {
      type = "leave_rejected";
      title = "Leave Request Rejected";
      message = `Your ${leave.type} request from ${new Date(
        leave.startDate
      ).toLocaleDateString()} to ${new Date(
        leave.endDate
      ).toLocaleDateString()} has been rejected`;
    } else if (leave.status === "cancelled") {
      type = "leave_cancelled";
      title = "Leave Request Cancelled";
      message = `Your ${leave.type} request from ${new Date(
        leave.startDate
      ).toLocaleDateString()} to ${new Date(
        leave.endDate
      ).toLocaleDateString()} has been cancelled`;
    } else {
      return;
    }

    // Notify the employee
    await Notification.create({
      recipientId: leave.employeeId,
      recipientEmail: leave.employeeEmail,
      senderId:
        leave.approvedBy || leave.rejectedBy || leave.cancelledBy || "System",
      senderName:
        leave.approvedBy || leave.rejectedBy || leave.cancelledBy || "System",
      type,
      title,
      message,
      module: "leave",
      moduleId: leave._id,
      relatedEmployeeId: leave.employeeId,
      relatedEmployeeName: leave.employee,
      actionUrl: `/leaves/${leave._id}`,
      priority: "medium",
    });

    console.log(
      `✅ Notified employee ${leave.employeeId} about leave status: ${leave.status}`
    );
  } catch (error) {
    console.error("Error notifying leave status update:", error);
  }
};

// Get leave settings
const getLeaveSettings = async (req, res) => {
  try {
    const settings = await getOrCreateLeaveSettings();
    res.json(settings);
  } catch (error) {
    console.error("Error getting leave settings:", error);
    res.status(500).json({ message: error.message });
  }
};

// FIXED: Update leave settings - PROPERLY HANDLES ALL SCENARIOS
const updateLeaveSettings = async (req, res) => {
  try {
    const { annualLeaveLimit, sickLeaveLimit, personalLeaveLimit, updatedBy } =
      req.body;

    if (!annualLeaveLimit || !sickLeaveLimit || !personalLeaveLimit) {
      return res.status(400).json({ message: "All leave limits are required" });
    }

    const currentSettings = await getOrCreateLeaveSettings();

    // Update settings first
    const settings = await LeaveSettings.findOneAndUpdate(
      { tenantId: "TENANT01" },
      {
        annualLeaveLimit: parseInt(annualLeaveLimit),
        sickLeaveLimit: parseInt(sickLeaveLimit),
        personalLeaveLimit: parseInt(personalLeaveLimit),
        lastUpdated: new Date(),
        updatedBy: updatedBy || "Admin",
      },
      { new: true, upsert: true }
    );

    // FIXED: Get all approved leaves to calculate actual usage
    const approvedLeaves = await Leave.find({ status: "approved" });

    // Group approved leaves by employee and type
    const employeeLeaveUsage = {};

    approvedLeaves.forEach((leave) => {
      if (!employeeLeaveUsage[leave.employeeId]) {
        employeeLeaveUsage[leave.employeeId] = {
          "Annual Leave": 0,
          "Sick Leave": 0,
          "Personal Leave": 0,
        };
      }
      employeeLeaveUsage[leave.employeeId][leave.type] += leave.days;
    });

    // FIXED: Update all employee balances based on ACTUAL USAGE and new limits
    const balances = await LeaveBalance.find({});
    await Promise.all(
      balances.map(async (balance) => {
        const usage = employeeLeaveUsage[balance.employeeId] || {
          "Annual Leave": 0,
          "Sick Leave": 0,
          "Personal Leave": 0,
        };

        const updatedBalance = {
          annualLeave: Math.max(
            0,
            parseInt(annualLeaveLimit) - usage["Annual Leave"]
          ),
          sickLeave: Math.max(
            0,
            parseInt(sickLeaveLimit) - usage["Sick Leave"]
          ),
          personalLeave: Math.max(
            0,
            parseInt(personalLeaveLimit) - usage["Personal Leave"]
          ),
        };

        console.log(`Employee ${balance.employeeId}:`);
        console.log(
          `  Annual: Used ${usage["Annual Leave"]} days, New Balance: ${updatedBalance.annualLeave}/${annualLeaveLimit}`
        );
        console.log(
          `  Sick: Used ${usage["Sick Leave"]} days, New Balance: ${updatedBalance.sickLeave}/${sickLeaveLimit}`
        );
        console.log(
          `  Personal: Used ${usage["Personal Leave"]} days, New Balance: ${updatedBalance.personalLeave}/${personalLeaveLimit}`
        );

        await LeaveBalance.findByIdAndUpdate(balance._id, updatedBalance);
      })
    );

    // Initialize balances for any new employees
    const employees = await Employee.find({});
    await Promise.all(
      employees.map(async (employee) => {
        const existingBalance = await LeaveBalance.findOne({
          employeeId: employee.employeeId,
        });
        if (!existingBalance) {
          await initializeLeaveBalance(employee.employeeId, employee.email);
        }
      })
    );

    res.json({
      message:
        "Leave settings updated successfully. Employee balances recalculated based on actual usage.",
      settings,
    });
  } catch (error) {
    console.error("Error updating leave settings:", error);
    res.status(500).json({ message: error.message });
  }
};

// FIXED: Get all leave balances - BASED ON ACTUAL USAGE
const getAllLeaveBalances = async (req, res) => {
  try {
    const settings = await getOrCreateLeaveSettings();
    const employees = await Employee.find({});
    const balances = await LeaveBalance.find({});

    // Get all approved leaves to calculate actual usage
    const approvedLeaves = await Leave.find({ status: "approved" });
    const employeeLeaveUsage = {};

    approvedLeaves.forEach((leave) => {
      if (!employeeLeaveUsage[leave.employeeId]) {
        employeeLeaveUsage[leave.employeeId] = {
          "Annual Leave": 0,
          "Sick Leave": 0,
          "Personal Leave": 0,
        };
      }
      employeeLeaveUsage[leave.employeeId][leave.type] += leave.days;
    });

    const balancesObj = {};

    await Promise.all(
      employees.map(async (employee) => {
        let existingBalance = balances.find(
          (b) => b.employeeId === employee.employeeId
        );

        // If no balance exists, create one
        if (!existingBalance) {
          existingBalance = await initializeLeaveBalance(
            employee.employeeId,
            employee.email
          );
        }

        const usage = employeeLeaveUsage[employee.employeeId] || {
          "Annual Leave": 0,
          "Sick Leave": 0,
          "Personal Leave": 0,
        };

        // Calculate correct balance based on actual usage
        const correctBalance = {
          annualLeave: Math.max(
            0,
            settings.annualLeaveLimit - usage["Annual Leave"]
          ),
          sickLeave: Math.max(0, settings.sickLeaveLimit - usage["Sick Leave"]),
          personalLeave: Math.max(
            0,
            settings.personalLeaveLimit - usage["Personal Leave"]
          ),
        };

        // Update DB if balance is incorrect
        if (
          existingBalance.annualLeave !== correctBalance.annualLeave ||
          existingBalance.sickLeave !== correctBalance.sickLeave ||
          existingBalance.personalLeave !== correctBalance.personalLeave
        ) {
          await LeaveBalance.findByIdAndUpdate(
            existingBalance._id,
            correctBalance
          );
        }

        balancesObj[employee.employeeId] = {
          annualLeave: correctBalance.annualLeave,
          sickLeave: correctBalance.sickLeave,
          personalLeave: correctBalance.personalLeave,
          employeeName: employee.name,
          employeeEmail: employee.email,
          employeeId: employee.employeeId,
          lastResetDate: existingBalance.lastResetDate,
          annualLeaveLimit: settings.annualLeaveLimit,
          sickLeaveLimit: settings.sickLeaveLimit,
          personalLeaveLimit: settings.personalLeaveLimit,
        };
      })
    );

    res.json(balancesObj);
  } catch (error) {
    console.error("Error getting all leave balances:", error);
    res.status(500).json({ message: error.message });
  }
};

// FIXED: Get leave balance for employee - BASED ON ACTUAL USAGE
const getLeaveBalance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    const settings = await getOrCreateLeaveSettings();
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    let balance = await LeaveBalance.findOne({ employeeId });
    if (!balance) {
      balance = await initializeLeaveBalance(employeeId, employee.email);
    }

    // Get actual approved leave usage
    const approvedLeaves = await Leave.find({
      employeeId: employeeId,
      status: "approved",
    });

    const usage = {
      "Annual Leave": 0,
      "Sick Leave": 0,
      "Personal Leave": 0,
    };

    approvedLeaves.forEach((leave) => {
      usage[leave.type] += leave.days;
    });

    // Calculate correct balance
    const correctBalance = {
      annualLeave: Math.max(
        0,
        settings.annualLeaveLimit - usage["Annual Leave"]
      ),
      sickLeave: Math.max(0, settings.sickLeaveLimit - usage["Sick Leave"]),
      personalLeave: Math.max(
        0,
        settings.personalLeaveLimit - usage["Personal Leave"]
      ),
    };

    // Update DB if balance is incorrect
    if (
      balance.annualLeave !== correctBalance.annualLeave ||
      balance.sickLeave !== correctBalance.sickLeave ||
      balance.personalLeave !== correctBalance.personalLeave
    ) {
      await LeaveBalance.findByIdAndUpdate(balance._id, correctBalance);
      balance = await LeaveBalance.findOne({ employeeId }); // Refresh balance
    }

    const enhancedBalance = {
      ...balance.toObject(),
      employeeName: employee.name,
      employeeEmail: employee.email,
      annualLeaveLimit: settings.annualLeaveLimit,
      sickLeaveLimit: settings.sickLeaveLimit,
      personalLeaveLimit: settings.personalLeaveLimit,
    };

    res.json(enhancedBalance);
  } catch (error) {
    console.error("Error getting leave balance:", error);
    res.status(500).json({ message: error.message });
  }
};

// FIXED: Update leave balance - WITH PROPER VALIDATION
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

    const settings = await getOrCreateLeaveSettings();
    const fieldMap = {
      "Annual Leave": "annualLeave",
      "Sick Leave": "sickLeave",
      "Personal Leave": "personalLeave",
    };

    const limitMap = {
      "Annual Leave": "annualLeaveLimit",
      "Sick Leave": "sickLeaveLimit",
      "Personal Leave": "personalLeaveLimit",
    };

    const field = fieldMap[leaveType];
    const limitField = limitMap[leaveType];

    if (!field) {
      throw new Error("Invalid leave type");
    }

    const maxLimit = settings[limitField];

    if (operation === "deduct") {
      if (balance[field] < days) {
        throw new Error(
          `Insufficient ${leaveType} balance. Available: ${balance[field]} days, Requested: ${days} days`
        );
      }
      balance[field] -= days;
    } else if (operation === "add") {
      balance[field] += days;
      // Cap at the current limit when adding back days
      if (balance[field] > maxLimit) {
        balance[field] = maxLimit;
      }
    }

    await balance.save();
    console.log(
      `Updated ${leaveType} balance for ${employeeId}: ${balance[field]} days (Max: ${maxLimit})`
    );
    return balance;
  } catch (error) {
    console.error("Error updating leave balance:", error);
    throw error;
  }
};

// FIXED: Reset all leave balances - USES CURRENT SETTINGS
const resetAllLeaveBalances = async (req, res) => {
  try {
    const settings = await getOrCreateLeaveSettings();
    const employees = await Employee.find({});

    await Promise.all(
      employees.map(async (employee) => {
        await LeaveBalance.findOneAndUpdate(
          { employeeId: employee.employeeId },
          {
            $set: {
              annualLeave: settings.annualLeaveLimit,
              sickLeave: settings.sickLeaveLimit,
              personalLeave: settings.personalLeaveLimit,
              employeeEmail: employee.email,
              lastResetDate: new Date(),
            },
          },
          { upsert: true, new: true }
        );
      })
    );

    res.json({
      message: "All leave balances reset successfully",
      limits: {
        annualLeave: settings.annualLeaveLimit,
        sickLeave: settings.sickLeaveLimit,
        personalLeave: settings.personalLeaveLimit,
      },
    });
  } catch (error) {
    console.error("Error resetting leave balances:", error);
    res.status(500).json({ message: error.message });
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

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
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

// FIXED: Create new leave request - WITH PROPER BALANCE CHECK
const createLeave = async (req, res) => {
  try {
    const {
      employeeId,
      type,
      startDate,
      endDate,
      reason,
      approver,
      approverId,
    } = req.body;

    console.log("Received leave request data:", req.body);

    if (!employeeId || !type || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

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

    const timeDiff = end.getTime() - start.getTime();
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;

    // FIXED: Direct balance check without calling getLeaveBalance function
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
    if (!field) {
      return res.status(400).json({ message: "Invalid leave type" });
    }

    if (balance[field] < days) {
      return res.status(400).json({
        message: `Insufficient ${type} balance. Available: ${balance[field]} days, Requested: ${days} days`,
      });
    }

    const leave = new Leave({
      employee: employee.name,
      employeeId,
      employeeEmail: employee.email,
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
    console.log("Leave saved to database with PENDING status:", savedLeave);

    // Notify admins about new leave application
    try {
      await notifyLeaveApplication(savedLeave);
    } catch (notificationError) {
      console.error("Error sending notifications:", notificationError);
    }

    res.status(201).json(savedLeave);
  } catch (error) {
    console.error("Error creating leave:", error);
    res.status(500).json({ message: error.message });
  }
};

// FIXED: Update leave status - WITH PROPER BALANCE UPDATES
const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy, rejectedBy, actionBy } = req.body;

    console.log("Updating leave status:", id, status, actionBy);

    if (!["approved", "rejected", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const currentLeave = await Leave.findById(id);
    if (!currentLeave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    const oldStatus = currentLeave.status;
    const updateData = { status };
    const now = new Date();

    if (status === "approved") {
      updateData.approvedDate = now;
      updateData.approvedBy = approvedBy || actionBy;
      updateData.rejectedDate = null;
      updateData.rejectedBy = null;

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
    } else if (status === "cancelled") {
      updateData.cancelledDate = now;
      updateData.cancelledBy = actionBy;

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

    try {
      await notifyLeaveStatusUpdate(leave, oldStatus);
    } catch (notificationError) {
      console.error(
        "Error sending status update notification:",
        notificationError
      );
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

    if (leave.status === "approved") {
      await updateLeaveBalance(leave.employeeId, leave.type, leave.days, "add");
    }

    await Leave.findByIdAndDelete(req.params.id);

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
  getLeaveBalance,
  updateLeaveBalance,
  resetAllLeaveBalances,
  initializeLeaveBalance,
  getAllLeaveBalances,
  getEmployeeIdByEmail,
  getLeaveSettings,
  updateLeaveSettings,
};
