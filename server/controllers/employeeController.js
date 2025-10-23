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

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedEmployeeId = employeeId.trim();

    // Check for duplicates with more specific queries
    const [existingEmployeeByEmail, existingEmployeeById, existingUser] = await Promise.all([
      Employee.findOne({ email: normalizedEmail }),
      Employee.findOne({ employeeId: normalizedEmployeeId }),
      User.findOne({ email: normalizedEmail })
    ]);

    // Detailed error messages
    if (existingEmployeeByEmail) {
      return res.status(400).json({ 
        error: 'Employee already exists',
        details: `Email ${normalizedEmail} is already registered`,
        field: 'email'
      });
    }
    
    if (existingEmployeeById) {
      return res.status(400).json({ 
        error: 'Employee already exists', 
        details: `Employee ID ${normalizedEmployeeId} is already in use`,
        field: 'employeeId'
      });
    }

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists',
        details: `User account with email ${normalizedEmail} already exists`,
        field: 'email'
      });
    }

    // Rest of your creation logic...
    const employeePassword = password || "Password123";
    
    const newEmployee = new Employee({ 
      employeeId: normalizedEmployeeId, 
      name, 
      email: normalizedEmail, 
      department, 
      designation,
      role,
      employmentType,
      status,
      sourceOfHire,
      location,
      dateOfJoining,
      totalExperience
    });
    
    await newEmployee.save();

    const newUser = new User({ 
      email: normalizedEmail, 
      password: employeePassword,
      role: 'employee', 
      employeeId: normalizedEmployeeId
    });
    
    await newUser.save();

    res.status(201).json({ 
      employee: newEmployee,
      tempPassword: !password ? employeePassword : undefined,
      message: `Employee ${name} created successfully. Login email: ${normalizedEmail}`
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