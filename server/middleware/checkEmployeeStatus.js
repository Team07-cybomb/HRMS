// middleware/checkEmployeeStatus.js
const User = require('../models/User.js');

const checkEmployeeStatus = async (req, res, next) => {
  try {
    const { employeeId } = req.user; // assume JWT middleware attach panniruke

    if (!employeeId)
      return res.status(400).json({ message: 'Employee ID missing' });

    // Get employee from DB
    const employee = await User.findOne({ employeeId });
    if (!employee)
      return res.status(404).json({ message: 'Employee not found' });

    if (employee.status !== 'active')
      return res.status(403).json({ message: 'Employee not active' });

    next(); // continue if active
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = checkEmployeeStatus;
