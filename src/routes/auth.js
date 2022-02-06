const express = require('express')
const router = express.Router()
const {
    register,
    login,
    forgotPassword,
    resetPassword,
    loginGoogle,
} = require('../controllers/auth')

// Auth get routes

// Auth post routes
router.post('/register', register)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/login/google', loginGoogle)

// Auth delete routes

// Auth update routes
router.put('/reset-password/:resetToken', resetPassword)

module.exports = router
