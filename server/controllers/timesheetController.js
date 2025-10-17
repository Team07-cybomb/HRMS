// controllers/timesheetController.js - FIXED
const Timesheet = require('../models/Timesheet');

// Get timesheets with filters
const getTimesheets = async (req, res) => {
  try {
    const { employeeId, period, status } = req.query;
    let filter = {};

    if (employeeId) {
      filter.employeeId = employeeId;
    }

    if (period) {
      filter.period = period;
    }

    if (status) {
      filter.status = status;
    }

    // FIX: Check user role properly - handle both single role and roles array
    const userRole = req.user.role || (req.user.roles && req.user.roles[0]);
    if (userRole !== 'admin' && userRole !== 'hr' && userRole !== 'employer') {
      // Regular users can only see their own records
      filter.employeeId = req.user.id || req.user._id;
    }

    const timesheets = await Timesheet.find(filter).sort({ period: -1 });
    res.json(timesheets);
  } catch (error) {
    console.error('Get timesheets error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit timesheet
const submitTimesheet = async (req, res) => {
  try {
    const { employeeId, employee, period, totalHours, approver, teamId } = req.body;

    const timesheet = new Timesheet({
      employeeId,
      employee,
      period,
      totalHours,
      approver,
      teamId,
      status: 'submitted'
    });

    await timesheet.save();
    res.status(201).json({ message: 'Timesheet submitted', timesheet });
  } catch (error) {
    console.error('Submit timesheet error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve/reject timesheet
const updateTimesheetStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const timesheet = await Timesheet.findByIdAndUpdate(
      id,
      { 
        status,
        approvedAt: status === 'approved' ? new Date() : null
      },
      { new: true }
    );

    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }

    res.json({ message: `Timesheet ${status}`, timesheet });
  } catch (error) {
    console.error('Update timesheet error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getTimesheets,
  submitTimesheet,
  updateTimesheetStatus
};