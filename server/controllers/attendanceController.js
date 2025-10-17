const Attendance = require('../models/Attendance');
const Timesheet = require('../models/Timesheet');
const ManualRequest = require('../models/ManualRequest');

// Check-in with location and photo
const checkIn = async (req, res) => {
  try {
    const { 
      employeeId, 
      employee, 
      checkInTime, 
      latitude, 
      longitude, 
      address, 
      accuracy,
      photo,
      teamId 
    } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      employeeId,
      date: today
    });

    if (existingAttendance && existingAttendance.checkIn) {
      return res.status(400).json({
        message: 'Already checked in for today'
      });
    }

    let attendance;
    
    if (existingAttendance) {
      // Update existing record
      attendance = await Attendance.findByIdAndUpdate(
        existingAttendance._id,
        {
          checkIn: checkInTime,
          checkInLocation: { latitude, longitude, address, accuracy },
          checkInPhoto: photo,
          status: 'present'
        },
        { new: true }
      );
    } else {
      // Create new record
      attendance = new Attendance({
        employeeId,
        employee,
        date: today,
        checkIn: checkInTime,
        checkInLocation: { latitude, longitude, address, accuracy },
        checkInPhoto: photo,
        status: 'present',
        teamId,
        location: address || 'Office'
      });
      await attendance.save();
    }

    res.status(200).json({
      message: 'Checked in successfully',
      attendance
    });

  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check-out with location and photo
const checkOut = async (req, res) => {
  try {
    const { 
      employeeId, 
      checkOutTime, 
      latitude, 
      longitude, 
      address, 
      accuracy,
      photo 
    } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employeeId,
      date: today
    });

    if (!attendance) {
      return res.status(404).json({
        message: 'No check-in record found for today'
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        message: 'Already checked out for today'
      });
    }

    // Calculate duration
    const checkInTime = new Date(`${today.toDateString()} ${attendance.checkIn}`);
    const checkOutTimeObj = new Date(`${today.toDateString()} ${checkOutTime}`);
    const durationMs = checkOutTimeObj - checkInTime;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const duration = `${hours}h ${minutes}m`;

    // Update attendance record
    attendance.checkOut = checkOutTime;
    attendance.checkOutLocation = { latitude, longitude, address, accuracy };
    attendance.checkOutPhoto = photo;
    attendance.duration = duration;

    await attendance.save();

    res.status(200).json({
      message: 'Checked out successfully',
      attendance
    });

  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// In attendanceController.js - Update getAttendance function
const getAttendance = async (req, res) => {
  try {
    const { date, employeeId, teamId, status } = req.query;
    let filter = {};

    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      filter.date = {
        $gte: targetDate,
        $lt: nextDay
      };
    }

    if (employeeId) {
      filter.employeeId = employeeId;
    }

    if (teamId) {
      filter.teamId = parseInt(teamId);
    }

    if (status) {
      filter.status = status;
    }

    // Fix: Check user role properly
    const userRole = req.user.role || req.user.roles?.[0];
    if (userRole !== 'admin' && userRole !== 'hr' && userRole !== 'employer') {
      // Regular users can only see their own attendance
      filter.employeeId = req.user.id;
    }

    const attendance = await Attendance.find(filter)
      .sort({ date: -1, checkIn: -1 })
      .select('-checkInPhoto -checkOutPhoto');

    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get specific attendance photo
const getAttendancePhoto = async (req, res) => {
  try {
    const { id, type } = req.params; // type: 'checkin' or 'checkout'
    
    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    const photo = type === 'checkin' ? attendance.checkInPhoto : attendance.checkOutPhoto;
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Return photo data (assuming base64)
    res.json({ photo });
  } catch (error) {
    console.error('Get photo error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get today's attendance for an employee
const getTodayAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employeeId,
      date: today
    });

    res.json(attendance || {});
  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// In attendanceController.js - FIXED createManualRequest
const createManualRequest = async (req, res) => {
  try {
    const { date, requestedIn, requestedOut, reason } = req.body;

    // FIX: Use safe fallbacks for all user data
    const manualRequest = new ManualRequest({
      employeeId: req.user.id || req.user._id, // Use either id or _id
      employee: req.user.name || req.user.email?.split('@')[0] || 'Employee', // Multiple fallbacks
      date: new Date(date),
      requestedIn,
      requestedOut,
      reason,
      teamId: req.user.teamId || 1 // Default team ID
    });

    await manualRequest.save();

    res.status(201).json({
      message: 'Manual attendance request submitted',
      request: manualRequest
    });
  } catch (error) {
    console.error('Manual request error:', error);
    
    // Handle duplicate request error
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'You already have a pending request for this date' 
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors 
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getAttendance,
  getAttendancePhoto,
  getTodayAttendance,
  createManualRequest
};