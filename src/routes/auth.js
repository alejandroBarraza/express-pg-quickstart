const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword } = require('../controllers/auth');

// Auth get routes

// Auth post routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// Auth delete routes

// Auth update routes
router.put('/reset-password/:bearerToken', resetPassword);

module.exports = router;
