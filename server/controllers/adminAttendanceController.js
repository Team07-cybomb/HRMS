// controllers/adminAttendanceController.js
const Attendance = require('../models/Attendance'); // Updated import
const Timesheet = require('../models/Timesheet');
const ManualRequest = require('../models/ManualRequest');
const Shift = require('../models/attendance/Shift');
const EmployeeShift = require('../models/attendance/EmployeeShift');
const AttendanceReport = require('../models/attendance/AttendanceReport');
const Employee = require('../models/Employee');

// Get comprehensive dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's attendance stats
    const todayAttendance = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: today,
            $lt: tomorrow
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total employees count from Employee model
    const totalEmployees = await Employee.countDocuments({ 
      status: 'active' 
    });

    // Get pending manual requests
    const pendingRequests = await ManualRequest.countDocuments({
      status: 'pending'
    });

    // Get pending timesheets
    const pendingTimesheets = await Timesheet.countDocuments({
      status: 'submitted'
    });

    // Calculate present, absent, late counts
    const stats = {
      totalEmployees,
      presentToday: 0,
      absentToday: 0,
      lateToday: 0,
      onLeave: 0,
      pendingRequests,
      pendingTimesheets
    };

    todayAttendance.forEach(item => {
      switch (item._id) {
        case 'present':
          stats.presentToday = item.count;
          break;
        case 'absent':
          stats.absentToday = item.count;
          break;
        case 'late':
          stats.lateToday = item.count;
          break;
        case 'half-day':
          stats.presentToday += item.count;
          break;
      }
    });

    // Calculate absent count (total employees - present employees)
    // Note: Removed onLeave calculation since it's not in the status enum
    stats.absentToday = Math.max(0, totalEmployees - stats.presentToday);

    res.json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get detailed attendance data with filters
const getAttendanceData = async (req, res) => {
  try {
    const { 
      date, 
      employeeId, 
      teamId, 
      status, 
      department,
      page = 1, 
      limit = 50 
    } = req.query;

    let filter = {};
    const skip = (page - 1) * limit;

    // Date filter - default to today if no date provided
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    filter.date = {
      $gte: targetDate,
      $lt: nextDay
    };

    // Other filters
    if (employeeId) filter.employeeId = employeeId;
    if (teamId) filter.teamId = parseInt(teamId);
    if (status) filter.status = status;

    const attendance = await Attendance.find(filter)
      .populate('employeeId', 'name email department')
      .sort({ date: -1, checkIn: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments(filter);

    res.json({
      attendance: attendance || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get attendance data error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create some sample attendance data for testing
const createSampleAttendanceData = async (req, res) => {
  try {
    // Get active employees
    const employees = await Employee.find({ status: 'active' }).limit(5);
    
    if (employees.length === 0) {
      return res.status(400).json({ 
        message: 'No active employees found. Please create employees first.' 
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Delete existing attendance for today (to avoid duplicates)
    await Attendance.deleteMany({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // Create sample attendance records
    const sampleRecords = [];
    const statuses = ['present', 'late', 'absent', 'present', 'half-day'];

    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      const status = statuses[i] || 'present';
      
      let checkIn = null;
      let checkOut = null;
      let duration = '0h 0m';

      if (status === 'present' || status === 'late') {
        checkIn = `09:${i * 10}:00`; // Staggered check-in times
        checkOut = '17:30:00';
        duration = '8h 30m';
      } else if (status === 'half-day') {
        checkIn = '09:00:00';
        checkOut = '13:00:00';
        duration = '4h 0m';
      }

      const record = new Attendance({
        employeeId: employee._id.toString(),
        employee: employee.name,
        date: today,
        checkIn,
        checkOut,
        duration,
        status,
        checkInLocation: {
          address: 'Office'
        },
        teamId: 1,
        shift: 'Day Shift',
        location: 'Office'
      });

      sampleRecords.push(record);
    }

    await Attendance.insertMany(sampleRecords);

    res.json({
      message: 'Sample attendance data created successfully',
      records: sampleRecords.length,
      date: today.toDateString()
    });
  } catch (error) {
    console.error('Create sample data error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get employees list for the frontend
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ status: 'active' })
      .select('_id name email department designation status')
      .sort({ name: 1 });

    res.json({
      employees: employees || []
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export attendance data
const exportAttendanceData = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      teamId, 
      format = 'json' 
    } = req.query;

    let filter = {};

    // Date range filter - default to today if no dates provided
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date();
    start.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 1); // Include end date

    filter.date = {
      $gte: start,
      $lt: end
    };

    if (teamId) filter.teamId = parseInt(teamId);

    const attendance = await Attendance.find(filter)
      .populate('employeeId', 'name email department')
      .sort({ date: 1, employeeId: 1 });

    // Create report record
    const report = new AttendanceReport({
      reportType: 'custom',
      title: `Attendance Export - ${startDate} to ${endDate}`,
      startDate: start,
      endDate: end,
      filters: { teamIds: teamId ? [parseInt(teamId)] : [] },
      generatedBy: req.user.id,
      generatedByName: req.user.name,
      data: { recordCount: attendance.length }
    });

    await report.save();

    if (format === 'csv') {
      // Convert to CSV
      const csvData = convertToCSV(attendance);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=attendance-${startDate}-to-${endDate}.csv`);
      return res.send(csvData);
    }

    res.json({
      message: 'Export successful',
      reportId: report._id,
      data: attendance
    });

  } catch (error) {
    console.error('Export attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to convert to CSV
const convertToCSV = (data) => {
  if (!data.length) return 'No data available';
  
  const headers = ['Employee Name', 'Date', 'Check In', 'Check Out', 'Duration', 'Status', 'Location', 'Shift'];
  
  let csv = headers.join(',') + '\n';
  
  data.forEach(item => {
    const row = [
      `"${item.employee}"`,
      `"${item.date.toISOString().split('T')[0]}"`,
      `"${item.checkIn || 'N/A'}"`,
      `"${item.checkOut || 'N/A'}"`,
      `"${item.duration || 'N/A'}"`,
      `"${item.status}"`,
      `"${item.location || 'Office'}"`,
      `"${item.shift || 'Day Shift'}"`
    ];
    csv += row.join(',') + '\n';
  });
  
  return csv;
};

module.exports = {
  getDashboardStats,
  getAttendanceData,
  exportAttendanceData,
  createSampleAttendanceData,
  getEmployees
};