// controllers/adminAttendanceController.js
const Attendance = require('../models/Attendance');
const Timesheet = require('../models/Timesheet');
const ManualRequest = require('../models/ManualRequest');
const Shift = require('../models/attendance/Shift');
const EmployeeShift = require('../models/attendance/EmployeeShift');
const AttendanceReport = require('../models/attendance/AttendanceReport');
const Employee = require('../models/Employee');

// In adminAttendanceController.js - Update getDashboardStats function
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
    stats.absentToday = Math.max(0, totalEmployees - stats.presentToday);

    res.json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// controllers/adminAttendanceController.js - Update getAttendanceData function
const getAttendanceData = async (req, res) => {
  try {
    const { 
      date, 
      employeeId, // This is now EMP003 (String), not ObjectId
      teamId, 
      status, 
      department,
      includeAbsent = 'false',
      page = 1, 
      limit = 100 
    } = req.query;

    const skip = (page - 1) * limit;
    const shouldIncludeAbsent = includeAbsent === 'true';

    // Date filter - default to today if no date provided
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get all active employees
    const activeEmployees = await Employee.find({ status: 'active' })
      .select('_id name email department designation employeeId') // Add employeeId field
      .lean();

    // Build base filter for attendance records
    let attendanceFilter = {
      date: {
        $gte: targetDate,
        $lt: nextDay
      }
    };

    // Apply additional filters - now using employeeId as String
    if (employeeId) {
      attendanceFilter.employeeId = employeeId; // Direct string comparison
    }
    if (teamId) attendanceFilter.teamId = parseInt(teamId);
    if (status) attendanceFilter.status = status;

    // Get existing attendance records - NO population needed since employeeId is String
    const existingAttendance = await Attendance.find(attendanceFilter)
      .sort({ date: -1, checkIn: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    console.log('Found attendance records:', existingAttendance.length);
    console.log('Sample record:', existingAttendance[0]);

    // Create a map of employee IDs to employee data for quick lookup
    const employeeMap = new Map();
    activeEmployees.forEach(emp => {
      // Map by employeeId (EMP003) for attendance lookup
      employeeMap.set(emp.employeeId, emp);
      // Also map by _id for fallback
      employeeMap.set(emp._id.toString(), emp);
    });

    // Process records to ensure consistent employee data
    const correctedAttendance = existingAttendance.map(record => {
      // Get employee data using employeeId (EMP003)
      const employeeData = employeeMap.get(record.employeeId);
      
      if (!employeeData) {
        console.warn(`No employee found for employeeId: ${record.employeeId} in record: ${record._id}`);
      }

      return {
        ...record,
        employeeId: record.employeeId, // Keep the EMP003
        employee: employeeData?.name || record.employee || 'Unknown Employee',
        employeeName: employeeData?.name || record.employee || 'Unknown Employee',
        employeeEmail: employeeData?.email,
        employeeDepartment: employeeData?.department,
        employeeObjectId: employeeData?._id // Add ObjectId for reference
      };
    });

    let finalAttendanceData = correctedAttendance;

    // If includeAbsent is true, create records for employees without attendance
    if (shouldIncludeAbsent) {
      const employeesWithAttendance = new Set(
        correctedAttendance.map(record => record.employeeId)
      );

      // Find employees without attendance records
      let employeesWithoutAttendance = activeEmployees.filter(employee => 
        !employeesWithAttendance.has(employee.employeeId)
      );

      // Apply employee filter to absent records if specified
      if (employeeId) {
        employeesWithoutAttendance = employeesWithoutAttendance.filter(employee => 
          employee.employeeId === employeeId
        );
      }

      // Create absent records for employees without attendance
      const absentRecords = employeesWithoutAttendance.map(employee => ({
        _id: `absent-${employee.employeeId}-${targetDate.toISOString().split('T')[0]}`,
        employeeId: employee.employeeId, // Use EMP003
        employee: employee.name,
        employeeName: employee.name,
        employeeEmail: employee.email,
        employeeDepartment: employee.department,
        employeeObjectId: employee._id,
        date: targetDate,
        checkIn: null,
        checkOut: null,
        checkInTime: null,
        checkOutTime: null,
        totalHours: 0,
        duration: '0h 0m',
        status: 'absent',
        location: null,
        checkInLocation: null,
        checkOutLocation: null,
        checkInPhoto: null,
        checkOutPhoto: null,
        shift: 'General Shift',
        shiftName: 'General Shift',
        notes: 'Employee was absent',
        isAbsentRecord: true
      }));

      // Combine existing attendance with absent records
      finalAttendanceData = [...correctedAttendance, ...absentRecords];

      // Apply status filter if specified
      if (status) {
        finalAttendanceData = finalAttendanceData.filter(record => record.status === status);
      }
    }

    const total = finalAttendanceData.length;

    res.json({
      attendance: finalAttendanceData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      metadata: {
        date: targetDate.toISOString().split('T')[0],
        includeAbsent: shouldIncludeAbsent,
        totalEmployees: activeEmployees.length,
        presentCount: correctedAttendance.filter(r => r.status === 'present' || r.status === 'late' || r.status === 'half-day').length,
        absentCount: finalAttendanceData.filter(r => r.status === 'absent').length
      }
    });
  } catch (error) {
    console.error('Get attendance data error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single attendance record details
const getAttendanceDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if it's an absent record ID format
    if (id.startsWith('absent-')) {
      // Extract employee ID and date from absent record ID
      const parts = id.split('-');
      const employeeId = parts[1];
      const date = parts.slice(2).join('-'); // Handle dates with hyphens

      // Find employee
      const employee = await Employee.findById(employeeId)
        .select('_id name email department designation')
        .lean();

      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      // Return absent record structure
      const absentRecord = {
        _id: id,
        employeeId: employee,
        employee: employee.name,
        employeeName: employee.name,
        date: new Date(date),
        checkIn: null,
        checkOut: null,
        checkInTime: null,
        checkOutTime: null,
        totalHours: 0,
        duration: '0h 0m',
        status: 'absent',
        location: null,
        checkInLocation: null,
        checkOutLocation: null,
        checkInPhoto: null,
        checkOutPhoto: null,
        shift: 'General Shift',
        shiftName: 'General Shift',
        notes: 'Employee was absent',
        isAbsentRecord: true
      };

      return res.json(absentRecord);
    }

    // Regular attendance record lookup
    const attendanceRecord = await Attendance.findById(id)
      .populate('employeeId', 'name email department designation')
      .lean();

    if (!attendanceRecord) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json(attendanceRecord);
  } catch (error) {
    console.error('Get attendance details error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// In adminAttendanceController.js - Update getEmployees function
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ status: 'active' })
      .select('_id name email department designation status employeeId') // Add employeeId
      .sort({ name: 1 });

    res.json({
      employees: employees || []
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// In adminAttendanceController.js - Update exportAttendanceData function
const exportAttendanceData = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      teamId, 
      department,
      includeAbsent = 'false',
      format = 'csv' 
    } = req.query;

    const shouldIncludeAbsent = includeAbsent === 'true';

    // Date range filter
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Get all active employees for reference
    const activeEmployees = await Employee.find({ status: 'active' })
      .select('_id name email department designation employeeId')
      .lean();

    // Build attendance filter
    let attendanceFilter = {
      date: {
        $gte: start,
        $lte: end
      }
    };

    if (teamId) attendanceFilter.teamId = parseInt(teamId);

    // Get existing attendance records
    const existingAttendance = await Attendance.find(attendanceFilter)
      .sort({ date: 1, employeeId: 1 })
      .lean();

    // Create employee map for lookup
    const employeeMap = new Map();
    activeEmployees.forEach(emp => {
      employeeMap.set(emp.employeeId, emp);
    });

    // Process attendance records with employee data
    const processedAttendance = existingAttendance.map(record => {
      const employeeData = employeeMap.get(record.employeeId);
      return {
        ...record,
        employeeName: employeeData?.name || record.employee,
        employeeEmail: employeeData?.email,
        employeeDepartment: employeeData?.department
      };
    });

    let finalData = processedAttendance;

    // Include absent employees if requested
    if (shouldIncludeAbsent) {
      // For date range, we need to generate absent records for each date
      const dateRange = getDatesInRange(start, end);
      const absentRecords = [];

      for (const date of dateRange) {
        const attendanceForDate = processedAttendance.filter(record => 
          new Date(record.date).toDateString() === date.toDateString()
        );

        const employeesWithAttendance = new Set(
          attendanceForDate.map(record => record.employeeId)
        );

        const employeesWithoutAttendance = activeEmployees.filter(employee => 
          !employeesWithAttendance.has(employee.employeeId)
        );

        // Create absent records for this date
        absentRecords.push(...employeesWithoutAttendance.map(employee => ({
          _id: `absent-${employee.employeeId}-${date.toISOString().split('T')[0]}`,
          employeeId: employee.employeeId,
          employee: employee.name,
          employeeName: employee.name,
          employeeEmail: employee.email,
          employeeDepartment: employee.department,
          date: date,
          checkIn: null,
          checkOut: null,
          totalHours: 0,
          duration: '0h 0m',
          status: 'absent',
          location: null,
          shift: 'General Shift',
          shiftName: 'General Shift',
          notes: 'Employee was absent',
          isAbsentRecord: true
        })));
      }

      finalData = [...processedAttendance, ...absentRecords].sort((a, b) => 
        new Date(a.date) - new Date(b.date) || a.employeeName.localeCompare(b.employeeName)
      );
    }

    // Rest of export logic remains the same...
    // Create report record
    const report = new AttendanceReport({
      reportType: 'custom',
      title: `Attendance Export - ${startDate} to ${endDate}${shouldIncludeAbsent ? ' (with absent)' : ''}`,
      startDate: start,
      endDate: end,
      filters: { 
        teamIds: teamId ? [parseInt(teamId)] : [],
        includeAbsent: shouldIncludeAbsent
      },
      generatedBy: req.user.id,
      generatedByName: req.user.name,
      data: { recordCount: finalData.length }
    });

    await report.save();

    if (format === 'csv') {
      const csvData = convertToCSV(finalData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=attendance-${startDate}-to-${endDate}${shouldIncludeAbsent ? '-with-absent' : ''}.csv`);
      return res.send(csvData);
    }

    res.json({
      message: 'Export successful',
      reportId: report._id,
      data: finalData,
      metadata: {
        recordCount: finalData.length,
        includeAbsent: shouldIncludeAbsent,
        dateRange: `${startDate} to ${endDate}`
      }
    });

  } catch (error) {
    console.error('Export attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Helper function to get all dates in a range
const getDatesInRange = (startDate, endDate) => {
  const dates = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

// Helper function to convert to CSV
const convertToCSV = (data) => {
  if (!data.length) return 'No data available';
  
  const headers = ['Employee Name', 'Email', 'Department', 'Date', 'Check In', 'Check Out', 'Duration', 'Status', 'Location', 'Shift', 'Notes'];
  
  let csv = headers.join(',') + '\n';
  
  data.forEach(item => {
    const row = [
      `"${item.employeeName || item.employee || 'Unknown'}"`,
      `"${item.employeeId?.email || 'N/A'}"`,
      `"${item.employeeId?.department || 'N/A'}"`,
      `"${new Date(item.date).toISOString().split('T')[0]}"`,
      `"${item.checkIn ? new Date(item.checkIn).toLocaleTimeString() : 'N/A'}"`,
      `"${item.checkOut ? new Date(item.checkOut).toLocaleTimeString() : 'N/A'}"`,
      `"${item.duration || '0h 0m'}"`,
      `"${item.status}"`,
      `"${item.location || 'N/A'}"`,
      `"${item.shiftName || item.shift || 'General Shift'}"`,
      `"${item.notes || ''}"`
    ];
    csv += row.join(',') + '\n';
  });
  
  return csv;
};

module.exports = {
  getDashboardStats,
  getAttendanceData,
  getAttendanceDetails, // Add this new function
  exportAttendanceData,
  getEmployees
};