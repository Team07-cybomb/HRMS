const Employee = require('../models/Employee.js');
const User = require('../models/User.js');
const bcrypt = require('bcryptjs');

// GET all employees
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD new employee
exports.addEmployee = async (req, res) => {
  try {
    const { name, email, department, designation, location, employeeId } = req.body;

    const existingEmployee = await Employee.findOne({ $or: [{ email }, { employeeId }] });
    if (existingEmployee) return res.status(400).json({ error: 'Employee already exists' });

    const newEmployee = new Employee({ employeeId, name, email, department, designation, location });
    await newEmployee.save();

    const tempPassword = "Password123";
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const newUser = new User({ email, password: hashedPassword, role: 'employee', employeeId });
    await newUser.save();

    res.status(201).json({ employee: newEmployee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findOneAndDelete({ employeeId: id });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    await User.findOneAndDelete({ employeeId: id });
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params; // EMP001, EMP002 etc
    const updateData = req.body;

    // Find employee by employeeId
    const employee = await Employee.findOne({ employeeId: id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      employee[key] = updateData[key];
    });

    await employee.save();

    res.status(200).json({ message: 'Employee updated successfully', employee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

