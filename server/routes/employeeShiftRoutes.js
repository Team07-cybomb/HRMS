// routes/employeeShiftRoutes.js
const express = require('express');
const { getEmployeeShiftAssignments } = require('../controllers/employeeShiftController');
const router = express.Router();

router.get('/employeesShifts', getEmployeeShiftAssignments);

module.exports = router;