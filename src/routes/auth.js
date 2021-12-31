const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword } = require('../controllers/auth');

// Auth get routes

// Auth post routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);

// Auth delete routes

// Auth update routes
router.put('/resetpassword/:bearerToken', resetPassword);

module.exports = router;
