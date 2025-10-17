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
    const { 
      name, 
      email, 
      department, 
      designation, 
      role,
      employmentType,
      status,
      sourceOfHire,
      location,
      dateOfJoining,
      totalExperience,
      employeeId, 
      password 
    } = req.body;

    // Check if employee already exists in either collection
    const existingEmployee = await Employee.findOne({ $or: [{ email }, { employeeId }] });
    const existingUser = await User.findOne({ email });
    
    if (existingEmployee || existingUser) {
      return res.status(400).json({ error: 'Employee already exists' });
    }

    // Use the provided password or default
    const employeePassword = password || "Password123";
    
    // Create employee record WITHOUT password hashing
    const newEmployee = new Employee({ 
      employeeId, 
      name, 
      email, 
      department, 
      designation,
      role,
      employmentType,
      status,
      sourceOfHire,
      location,
      dateOfJoining,
      totalExperience
      // Don't store password in Employee collection for authentication
    });
    await newEmployee.save();

    // Create user account - User model will automatically hash the password
    const newUser = new User({ 
      email, 
      password: employeePassword, // Pass plain password - User schema will hash it
      role: 'employee', 
      employeeId: employeeId
    });
    await newUser.save();

    console.log('Employee created with ID:', newEmployee.employeeId);
    console.log('User created for email:', newUser.email);

    res.status(201).json({ 
      employee: newEmployee,
      tempPassword: !password ? employeePassword : undefined,
      message: `Employee ${name} created successfully. Login email: ${email}`
    });
  } catch (err) {
    console.error('Error adding employee:', err);
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

// UPDATE employee
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params; // EMP001, EMP002 etc
    const updateData = req.body;

    // Find employee by employeeId
    const employee = await Employee.findOne({ employeeId: id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // If password is being updated, only update User collection
    if (updateData.password) {
      // Update User password (plain - will be hashed by User model's pre-save)
      await User.findOneAndUpdate(
        { employeeId: id },
        { password: updateData.password }
      );
      // Remove password from updateData so we don't save it in Employee collection
      delete updateData.password;
    }

    // Update other fields in Employee collection
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