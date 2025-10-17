// controllers/manualRequestController.js
const ManualRequest = require('../models/ManualRequest');
const Attendance = require('../models/Attendance');

// In manualRequestController.js - Fix role checking
const getManualRequests = async (req, res) => {
  try {
    const { status, employeeId, startDate, endDate } = req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (employeeId) {
      filter.employeeId = employeeId;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // FIX: Check user role properly
    const userRole = req.user.role || (req.user.roles && req.user.roles[0]);
    if (userRole !== 'admin' && userRole !== 'hr' && userRole !== 'employer') {
      filter.teamId = req.user.teamId;
    }

    const requests = await ManualRequest.find(filter)
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get manual requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve manual request and create attendance record
const approveManualRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const approverId = req.user.id;

    const manualRequest = await ManualRequest.findById(id);
    if (!manualRequest) {
      return res.status(404).json({ message: 'Manual request not found' });
    }

    // Check if request is already processed
    if (manualRequest.status !== 'pending') {
      return res.status(400).json({ message: `Request already ${manualRequest.status}` });
    }

    // Check if attendance record already exists for this date
    const existingAttendance = await Attendance.findOne({
      employeeId: manualRequest.employeeId,
      date: manualRequest.date
    });

    if (existingAttendance) {
      return res.status(400).json({ 
        message: 'Attendance record already exists for this date' 
      });
    }

    // Create attendance record from manual request
    const attendance = new Attendance({
      employeeId: manualRequest.employeeId,
      employee: manualRequest.employee,
      date: manualRequest.date,
      checkIn: manualRequest.requestedIn,
      checkOut: manualRequest.requestedOut,
      status: 'present',
      teamId: manualRequest.teamId,
      location: 'Manual Entry',
      duration: calculateDuration(manualRequest.requestedIn, manualRequest.requestedOut)
    });

    await attendance.save();
    
    // Update manual request status
    await manualRequest.approve(approverId);

    res.json({
      message: 'Manual request approved and attendance record created',
      manualRequest,
      attendance
    });

  } catch (error) {
    console.error('Approve manual request error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Attendance record already exists for this employee and date' 
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject manual request
const rejectManualRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const approverId = req.user.id;

    const manualRequest = await ManualRequest.findById(id);
    if (!manualRequest) {
      return res.status(404).json({ message: 'Manual request not found' });
    }

    if (manualRequest.status !== 'pending') {
      return res.status(400).json({ message: `Request already ${manualRequest.status}` });
    }

    await manualRequest.reject(approverId, rejectionReason);

    res.json({
      message: 'Manual request rejected',
      manualRequest
    });

  } catch (error) {
    console.error('Reject manual request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to calculate duration
const calculateDuration = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return '0h 0m';
  
  try {
    const parseTime = (timeStr) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      
      return hours * 60 + minutes;
    };

    const startMinutes = parseTime(checkIn);
    const endMinutes = parseTime(checkOut);
    
    let totalMinutes = endMinutes - startMinutes;
    
    // Handle overnight shifts (if end time is earlier than start time)
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  } catch (error) {
    return '0h 0m';
  }
};

// Get manual requests for specific employee
const getEmployeeManualRequests = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const requests = await ManualRequest.find({ employeeId })
      .sort({ date: -1, createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get employee manual requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update manual request (for employee to edit pending requests)
const updateManualRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { requestedIn, requestedOut, reason } = req.body;

    const manualRequest = await ManualRequest.findById(id);
    if (!manualRequest) {
      return res.status(404).json({ message: 'Manual request not found' });
    }

    // Only allow updates to pending requests and only by the employee who created it
    if (manualRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot update processed request' });
    }

    if (manualRequest.employeeId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    manualRequest.requestedIn = requestedIn || manualRequest.requestedIn;
    manualRequest.requestedOut = requestedOut || manualRequest.requestedOut;
    manualRequest.reason = reason || manualRequest.reason;

    await manualRequest.save();

    res.json({
      message: 'Manual request updated',
      manualRequest
    });

  } catch (error) {
    console.error('Update manual request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete manual request (for employee to delete pending requests)
const deleteManualRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const manualRequest = await ManualRequest.findById(id);
    if (!manualRequest) {
      return res.status(404).json({ message: 'Manual request not found' });
    }

    // Only allow deletion of pending requests and only by the employee who created it
    if (manualRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot delete processed request' });
    }

    if (manualRequest.employeeId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this request' });
    }

    await ManualRequest.findByIdAndDelete(id);

    res.json({
      message: 'Manual request deleted'
    });

  } catch (error) {
    console.error('Delete manual request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getManualRequests,
  approveManualRequest,
  rejectManualRequest,
  getEmployeeManualRequests,
  updateManualRequest,
  deleteManualRequest
};