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



// Update the assignShiftToEmployee function
const assignShiftToEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      shiftId,
      effectiveDate
    } = req.body;

    console.log('Assign shift request received:', { employeeId, shiftId, effectiveDate });

    // Validate required fields
    if (!employeeId || !shiftId || !effectiveDate) {
      return res.status(400).json({ 
        message: 'Missing required fields: employeeId, shiftId, effectiveDate' 
      });
    }

    // ✅ Convert string ID to ObjectId for proper querying
    let employeeObjectId, shiftObjectId;
    try {
      employeeObjectId = new mongoose.Types.ObjectId(employeeId);
      shiftObjectId = new mongoose.Types.ObjectId(shiftId);
    } catch (error) {
      return res.status(400).json({ 
        message: 'Invalid ID format provided' 
      });
    }

    // ✅ Check if employee exists in Employee collection (not User)
    const employee = await Employee.findOne({ 
      _id: employeeObjectId,
      status: 'active'
    });

    if (!employee) {
      console.log('Employee not found in Employee collection with ID:', employeeId);
      
      // Debug: Check what employees exist
      const allEmployees = await Employee.find({}).select('_id name email status').limit(5);
      console.log('Available employees:', allEmployees);
      
      return res.status(404).json({ 
        message: 'Employee not found in employee database',
        availableEmployees: allEmployees,
        searchedId: employeeId
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

    // Deactivate any current active assignment
    await EmployeeShift.updateMany(
      { 
        employeeId: employeeObjectId, 
        isActive: true 
      },
      { 
        isActive: false, 
        endDate: new Date(effectiveDate),
        updatedAt: new Date()
      }
    );

    // Create new assignment
    const employeeShift = new EmployeeShift({
      employeeId: employeeObjectId,
      employeeName: employee.name,
      shiftId: shiftObjectId,
      shiftName: shift.name,
      effectiveDate: new Date(effectiveDate),
      assignedBy: req.user.id,
      assignedByName: req.user.name || 'System Admin',
      teamId: employee.teamId || 1
    });

    await employeeShift.save();

    console.log('Shift assigned successfully to:', employee.name);

    // Populate the response for better frontend display
    const populatedAssignment = await EmployeeShift.findById(employeeShift._id)
      .populate('employeeId', 'name email')
      .populate('shiftId', 'name startTime endTime');

    res.status(201).json({
      message: 'Shift assigned successfully',
      assignment: {
        _id: populatedAssignment._id,
        employeeId: populatedAssignment.employeeId._id,
        employeeName: populatedAssignment.employeeId.name,
        shiftId: populatedAssignment.shiftId._id,
        shiftName: populatedAssignment.shiftId.name,
        effectiveDate: populatedAssignment.effectiveDate,
        isActive: populatedAssignment.isActive,
        assignedByName: populatedAssignment.assignedByName
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

// Get employee shift assignments
const getEmployeeAssignments = async (req, res) => {
  try {
    const { employeeId, activeOnly = 'true' } = req.query;
    
    let filter = {};
    if (employeeId) {
      try {
        filter.employeeId = new mongoose.Types.ObjectId(employeeId);
      } catch (error) {
        return res.status(400).json({ message: 'Invalid employee ID format' });
      }
    }
    if (activeOnly === 'true') filter.isActive = true;

    const assignments = await EmployeeShift.find(filter)
      .populate('employeeId', 'name email department') // Populate from Employee model
      .populate('shiftId', 'name startTime endTime')
      .sort({ effectiveDate: -1 });

    res.json(assignments);
  } catch (error) {
    console.error('Get employee assignments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update employee assignment
const updateEmployeeAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { endDate, isActive } = req.body;

    const assignment = await EmployeeShift.findByIdAndUpdate(
      id,
      { endDate, isActive, updatedAt: Date.now() },
      { new: true }
    ).populate('shiftId');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json({
      message: 'Assignment updated successfully',
      assignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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