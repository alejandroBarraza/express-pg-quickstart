const { query } = require('../db');
const hashedPassword = require('../utils/utils');
//initial path routes: '/api/auth'

//register user controller
const register = async (req, res, next) => {
    // add validation for username,email and password;
    const { username, email, password } = req.body;
    const passwordHashed = await hashedPassword(password);
    try {
        const { rows } = await query(
            `INSERT INTO users (username,email,password) VALUES ($1,$2,$3) RETURNING *`,
            [username, email, passwordHashed]
        );
        res.status(200).json({
            status: 'success',
            results: rows.length,
            user: rows,
        });
    } catch (err) {
        console.log(err);
    }
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
