const { query } = require('../db');
//initial path routes: '/api/auth'

//register user controller
const register = async (req, res, next) => {
    res.send('Register route testing');
};

// login user controller
const login = async (req, res, next) => {
    res.send('Login route testing');
};

// forgot password controller
const forgotPassword = async (req, res, next) => {
    res.send('Forgot password route testing');
};

// reset password controller
const resetPassword = async (req, res, next) => {
    res.send('forgor password route testing');
};

module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword,
};
