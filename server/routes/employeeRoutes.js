const express = require('express');
const { getEmployees, addEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController.js');
const router = express.Router();
const {getEmployeeShiftAssignments} = require("../controllers/employeeShiftController.js")
router.get('/', getEmployees);
router.post('/', addEmployee);
router.put('/:id',updateEmployee);
router.delete('/:id', deleteEmployee);
router.get('/employeesShifts', getEmployeeShiftAssignments);
module.exports = router;