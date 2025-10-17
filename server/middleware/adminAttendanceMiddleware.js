// middleware/adminMiddleware.js
const adminMiddleware = (req, res, next) => {
  try {
    const userRole = req.user.role || (req.user.roles && req.user.roles[0]);
    
    // Allow admin, hr, and employer roles
    if (userRole !== 'admin' && userRole !== 'hr' && userRole !== 'employer') {
      return res.status(403).json({ 
        message: 'Access denied. Admin/HR role required.' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(403).json({ message: 'Access denied' });
  }
};

module.exports = { adminMiddleware };