const express = require('express');
const { getEmployees, addEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController.js');
const { authMiddleware, hrMiddleware } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.get('/', getEmployees);
router.post('/', addEmployee);
router.put('/:id',updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router;