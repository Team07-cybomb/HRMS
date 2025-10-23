const Shift = require('../models/attendance/Shift');
const EmployeeShift = require('../models/attendance/EmployeeShift');
const Employee = require('../models/Employee'); 
const mongoose = require('mongoose');
// Create new shift
const createShift = async (req, res) => {
  try {
    const {
      name,
      startTime,
      endTime,
      breakDuration,
      description,
      teamIds
    } = req.body;

    // Check if shift with same name exists
    const existingShift = await Shift.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingShift) {
      return res.status(400).json({ 
        message: 'Shift with this name already exists' 
      });
    }

    const shift = new Shift({
      name,
      startTime,
      endTime,
      breakDuration: breakDuration || 60,
      description,
      teamIds: teamIds || [],
      createdBy: req.user.id
    });

    await shift.save();

    res.status(201).json({
      message: 'Shift created successfully',
      shift
    });
  } catch (error) {
    console.error('Create shift error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all shifts
const getShifts = async (req, res) => {
  try {
    const { activeOnly = 'true' } = req.query;
    
    let filter = {};
    if (activeOnly === 'true') {
      filter.isActive = true;
    }

    const shifts = await Shift.find(filter).sort({ name: 1 });
    res.json(shifts);
  } catch (error) {
    console.error('Get shifts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update shift
const updateShift = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const shift = await Shift.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    res.json({
      message: 'Shift updated successfully',
      shift
    });
  } catch (error) {
    console.error('Update shift error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete shift (soft delete)
const deleteShift = async (req, res) => {
  try {
    const { id } = req.params;

    const shift = await Shift.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    // Also deactivate any active employee assignments
    await EmployeeShift.updateMany(
      { shiftId: id, isActive: true },
      { isActive: false, endDate: new Date() }
    );

    res.json({
      message: 'Shift deleted successfully',
      shift
    });
  } catch (error) {
    console.error('Delete shift error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// In shiftController.js - CORRECTED VERSION
const assignShiftToEmployee = async (req, res) => {
  try {
    const {
      employeeId, // This is EMP003 format (string)
      employeeName, // Employee name from frontend
      shiftId, // This is MongoDB ObjectId (string)
      effectiveDate,
      endDate
    } = req.body;

    console.log('Assign shift request received:', { 
      employeeId, 
      employeeName, 
      shiftId, 
      effectiveDate, 
      endDate 
    });

    // Validate required fields
    if (!employeeId || !shiftId || !effectiveDate) {
      return res.status(400).json({ 
        message: 'Missing required fields: employeeId, shiftId, effectiveDate' 
      });
    }

    // Validate dates
    if (endDate && new Date(endDate) <= new Date(effectiveDate)) {
      return res.status(400).json({
        message: 'End date must be after effective date'
      });
    }

    // ✅ Validate shiftId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(shiftId)) {
      return res.status(400).json({ 
        message: 'Invalid shift ID format' 
      });
    }

    const shiftObjectId = new mongoose.Types.ObjectId(shiftId);

    // ✅ Check if employee exists in Employee collection using employeeId (EMP003)
    const employee = await Employee.findOne({ 
      employeeId: employeeId, // Search by employeeId field (EMP003)
      status: 'active'
    });

    if (!employee) {
      console.log('Employee not found with employeeId:', employeeId);
      
      // Debug: Check what employees exist
      const allEmployees = await Employee.find({}).select('_id name email employeeId status').limit(5);
      console.log('Available employees:', allEmployees);
      
      return res.status(404).json({ 
        message: 'Employee not found in employee database',
        availableEmployees: allEmployees,
        searchedEmployeeId: employeeId
      });
    }

    // Check if shift exists and is active
    const shift = await Shift.findOne({ 
      _id: shiftObjectId,
      isActive: true 
    });

    if (!shift) {
      console.log('Shift not found or inactive with ID:', shiftId);
      return res.status(404).json({ 
        message: 'Active shift not found' 
      });
    }

    // Deactivate any current active assignment for this employee
    await EmployeeShift.updateMany(
      { 
        employeeId: employeeId, // Use employeeId (EMP003)
        isActive: true 
      },
      { 
        isActive: false, 
        endDate: new Date(effectiveDate),
        updatedAt: new Date()
      }
    );

// In shiftController.js - Update the assignment creation part
// Create new assignment with all required data
const employeeShift = new EmployeeShift({
  employeeId: employeeId, // Store as EMP003 string
  employeeName: employeeName || employee.name, // Ensure name is set
  shiftId: shiftObjectId,
  shiftName: shift.name, // Ensure shift name is set
  effectiveDate: new Date(effectiveDate),
  endDate: endDate ? new Date(endDate) : null,
  assignedBy: req.user?.id || 'system',
  assignedByName: req.user?.name || 'System Admin',
  teamId: employee.teamId || 1
});

await employeeShift.save();
console.log('Shift assignment saved with data:', {
  employeeId: employeeShift.employeeId,
  employeeName: employeeShift.employeeName,
  shiftName: employeeShift.shiftName,
  effectiveDate: employeeShift.effectiveDate
});

    // Return the assignment without population for now
    res.status(201).json({
      message: 'Shift assigned successfully',
      assignment: {
        _id: employeeShift._id,
        employeeId: employeeShift.employeeId,
        employeeName: employeeShift.employeeName,
        shiftId: employeeShift.shiftId,
        shiftName: employeeShift.shiftName,
        effectiveDate: employeeShift.effectiveDate,
        endDate: employeeShift.endDate,
        isActive: employeeShift.isActive,
        // assignedByName: employeeShift.assignedByName
      }
    });
  } catch (error) {
    console.error('Assign shift error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid ID format provided' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during shift assignment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// In shiftController.js - Update getEmployeeAssignments to ensure proper data
const getEmployeeAssignments = async (req, res) => {
  try {
    const { employeeId, activeOnly = 'true' } = req.query;
    
    let filter = {};
    if (employeeId) {
      filter.employeeId = employeeId;
    }
    if (activeOnly === 'true') filter.isActive = true;

    console.log('Fetching employee assignments with filter:', filter);

    const assignments = await EmployeeShift.find(filter)
      .populate('shiftId', 'name startTime endTime')
      .sort({ effectiveDate: -1 });

    console.log(`Found ${assignments.length} assignments`);

    // Ensure we have proper employee names even if population fails
    const assignmentsWithFallback = await Promise.all(
      assignments.map(async (assignment) => {
        // If employeeName is missing, try to fetch it from Employee collection
        if (!assignment.employeeName) {
          try {
            const employee = await Employee.findOne({ 
              employeeId: assignment.employeeId 
            }).select('name');
            
            if (employee) {
              assignment.employeeName = employee.name;
              // Optionally save the updated assignment
              await assignment.save();
            }
          } catch (error) {
            console.error('Error fetching employee name:', error);
          }
        }
        
        return assignment;
      })
    );

    res.json(assignmentsWithFallback);
  } catch (error) {
    console.error('Get employee assignments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// In shiftController.js - Update the updateEmployeeAssignment function
const updateEmployeeAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { shiftId, effectiveDate, endDate, isActive } = req.body;

    console.log('Update assignment request:', { id, shiftId, effectiveDate, endDate, isActive });

    // Validate required fields
    if (!shiftId || !effectiveDate) {
      return res.status(400).json({ 
        message: 'Missing required fields: shiftId, effectiveDate' 
      });
    }

    // Validate dates
    if (endDate && new Date(endDate) <= new Date(effectiveDate)) {
      return res.status(400).json({
        message: 'End date must be after effective date'
      });
    }

    // Convert shiftId to ObjectId
    let shiftObjectId;
    try {
      shiftObjectId = new mongoose.Types.ObjectId(shiftId);
    } catch (error) {
      return res.status(400).json({ 
        message: 'Invalid shift ID format' 
      });
    }

    // Check if shift exists and is active
    const shift = await Shift.findOne({ 
      _id: shiftObjectId,
      isActive: true 
    });

    if (!shift) {
      return res.status(404).json({ 
        message: 'Active shift not found' 
      });
    }

    // Find the current assignment
    const currentAssignment = await EmployeeShift.findById(id);

    if (!currentAssignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    console.log('Current assignment employeeId:', currentAssignment.employeeId);

    // Update the assignment with new data
    const updatedAssignment = await EmployeeShift.findByIdAndUpdate(
      id,
      { 
        shiftId: shiftObjectId,
        shiftName: shift.name,
        effectiveDate: new Date(effectiveDate),
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? isActive : currentAssignment.isActive,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    console.log('Assignment updated successfully:', updatedAssignment._id);

    res.json({
      message: 'Assignment updated successfully',
      assignment: {
        _id: updatedAssignment._id,
        employeeId: updatedAssignment.employeeId,
        employeeName: updatedAssignment.employeeName,
        shiftId: updatedAssignment.shiftId,
        shiftName: updatedAssignment.shiftName,
        effectiveDate: updatedAssignment.effectiveDate,
        endDate: updatedAssignment.endDate,
        isActive: updatedAssignment.isActive
      }
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid ID format provided' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during assignment update',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
module.exports = {
  createShift,
  getShifts,
  updateShift,
  deleteShift,
  assignShiftToEmployee,
  getEmployeeAssignments,
  updateEmployeeAssignment
};