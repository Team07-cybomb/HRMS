const express = require('express');
const { loginUser, registerUser } = require('../controllers/authController.js');

const router = express.Router();

// REGISTER
router.post('/register', registerUser);

// LOGIN
router.post('/login', loginUser);

module.exports = router;