// controllers/authController.js
const User = require('../models/User.js');
const Employee = require('../models/Employee.js')
const jwt = require('jsonwebtoken');

// REGISTER USER (manual ID)
exports.registerUser = async (req, res) => {
  const { email, password, role, adminId, hrId, employeeId } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const newUser = new User({
      email,
      password,
      role,
      adminId,
      hrId,
      employeeId,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      _id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      adminId: newUser.adminId,
      hrId: newUser.hrId,
      employeeId: newUser.employeeId,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1️⃣ Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    // 2️⃣ Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    // 3️⃣ If role is employee, check status in Employee collection
    if (user.role === 'employee') {
      if (!user.employeeId) {
        return res.status(400).json({ message: 'Employee ID not linked with user' });
      }

      const employee = await Employee.findOne({ employeeId: user.employeeId });
      if (!employee) {
        return res.status(400).json({ message: 'Employee record not found' });
      }

      // ✅ Allow only if status is "active" or "onprobation"
      if (employee.status !== 'active' && employee.status !== 'on-probation') {
        return res.status(403).json({
          message: `Your account is currently '${employee.status}'. Please contact admin.`,
        });
      }
    }

    // 4️⃣ Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 5️⃣ Respond with user data + token
    res.status(200).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      adminId: user.adminId || null,
      hrId: user.hrId || null,
      employeeId: user.employeeId || null,
      token,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// LOGIN USER
// exports.loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // 1️⃣ Find user by email
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'User not found' });

//     // 2️⃣ Check password
//     const isMatch = await user.matchPassword(password);
//     if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

//     // 3️⃣ Generate JWT token
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '1d' }
//     );

//     // 4️⃣ Respond with user data + token
//     res.status(200).json({
//       _id: user._id,
//       email: user.email,
//       role: user.role,
//       adminId: user.adminId || null,
//       hrId: user.hrId || null,
//       employeeId: user.employeeId || null,
//       token,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };