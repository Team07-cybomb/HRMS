// routes/adminAttendanceRoutes.js
const express = require('express');
const {
  getDashboardStats,
  getAttendanceData,
  exportAttendanceData,
  createSampleAttendanceData,
  getEmployees
} = require('../controllers/adminAttendanceController');

const {
  createShift,
  getShifts,
  updateShift,
  deleteShift,
  assignShiftToEmployee,
  getEmployeeAssignments,
  updateEmployeeAssignment
} = require('../controllers/shiftController');

const { authMiddleware } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminAttendanceMiddleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Debug route to test if routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'Admin routes are working!', user: req.user });
});

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/attendance/data', getAttendanceData);
router.get('/attendance/export', exportAttendanceData);
router.post('/attendance/sample-data', createSampleAttendanceData); // Add this line

// Employee routes
router.get('/employees', getEmployees); // Add this line

// Shift management routes
router.post('/shifts', createShift);
router.get('/shifts', getShifts);
router.put('/shifts/:id', updateShift);
router.delete('/shifts/:id', deleteShift);

// Employee shift assignment routes
router.post('/shifts/assign', assignShiftToEmployee);
router.get('/shifts/assignments', getEmployeeAssignments);
router.put('/shifts/assignments/:id', updateEmployeeAssignment);

// Debug employee lookup route
router.get('/debug/employee/:id', async (req, res) => {
  try {
    const Employee = require('../models/Employee');
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      // Try all users to see what's in DB
      const allEmployees = await Employee.find({}).select('_id name email status').limit(10);
      return res.status(404).json({ 
        message: 'Employee not found', 
        searchedId: req.params.id,
        availableEmployees: allEmployees 
      });
    }
    
    res.json({ 
      message: 'Employee found', 
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        status: employee.status
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error finding employee', 
      error: error.message 
    });
  }
});

module.exports = router;