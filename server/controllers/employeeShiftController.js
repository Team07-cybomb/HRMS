// controllers/employeeShiftController.js
const EmployeeShift = require('../models/attendance/EmployeeShift');
const Employee = require('../models/Employee');
const mongoose = require('mongoose');

// Get all employee shift assignments
const getEmployeeShiftAssignments = async (req, res) => {
  try {
    const { employeeId, userId } = req.query;

    console.log('Received query params:', { employeeId, userId });

    let filter = { isActive: true };
    
    // If employeeId is provided (like EMP002), find the employee first
    if (employeeId) {
      console.log('Looking for employee with employeeId:', employeeId);
      
      // Find employee by employeeId (string like EMP002)
      const employee = await Employee.findOne({ employeeId: employeeId });
      
      if (employee) {
        console.log('Found employee:', {
          _id: employee._id,
          employeeId: employee.employeeId,
          name: employee.name
        });
        
        // Use the employee's employeeId (string) for filtering
        filter.employeeId = employee.employeeId;
      } else {
        console.log('No employee found with employeeId:', employeeId);
        return res.json({
          success: true,
          assignments: []
        });
      }
    } 
    // If userId is provided (MongoDB ObjectId), find the employee
    else if (userId) {
      console.log('Looking for employee with userId:', userId);
      
      // Check if userId is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(userId)) {
        const employee = await Employee.findOne({ _id: userId });
        if (employee) {
          console.log('Found employee by userId:', {
            _id: employee._id,
            employeeId: employee.employeeId,
            name: employee.name
          });
          filter.employeeId = employee.employeeId;
        } else {
          console.log('No employee found with userId:', userId);
          return res.json({
            success: true,
            assignments: []
          });
        }
      }
    }

    console.log('Final filter for EmployeeShift:', filter);

    const assignments = await EmployeeShift.find(filter)
      .populate('shiftId', 'name startTime endTime breakDuration isActive')
      .sort({ effectiveDate: -1 });

    console.log('Found assignments:', assignments.length);

    // Format response for frontend
    const formattedAssignments = assignments.map(assignment => ({
      _id: assignment._id,
      employeeId: assignment.employeeId,
      employeeName: assignment.employeeName,
      shiftId: assignment.shiftId?._id,
      shiftName: assignment.shiftId?.name,
      startTime: assignment.shiftId?.startTime,
      endTime: assignment.shiftId?.endTime,
      breakDuration: assignment.shiftId?.breakDuration,
      isActive: assignment.isActive,
      effectiveDate: assignment.effectiveDate
    }));

    res.json({
      success: true,
      assignments: formattedAssignments
    });
  } catch (error) {
    console.error('Get employee shift assignments error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching shift assignments', 
      error: error.message 
    });
  }
};

module.exports = { getEmployeeShiftAssignments };