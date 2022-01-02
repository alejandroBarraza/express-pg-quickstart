const { query } = require('../db');
const { hashedPassword, decryptPassword } = require('../utils/utils');
const { RegisterValidation, loginValidation } = require('../utils/validations');
//initial path routes: '/api/auth'

//register user controller
const register = async (req, res, next) => {
    // hashing password
    const { username, email, password } = req.body;
    const passwordHashed = await hashedPassword(password);

    // validating user data
    const { error } = RegisterValidation(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    //  check if user already exists
    const { rows: userExist } = await query('SELECT username FROM users WHERE username = $1', [
        username,
    ]);

    if (userExist && userExist.length > 0) {
        return res.status(400).json({ error: 'User already exist' });
    }

    // check if mail already exists
    const { rows: mailExist } = await query('SELECT email FROM users WHERE email = $1', [email]);
    if (mailExist && mailExist.length > 0) {
        return res.status(400).json({ error: 'Mail already exist' });
    }

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
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error,
        });
    }
};

// login user controller
const login = async (req, res, next) => {
    // validate username and password
    const { username, password } = req.body;
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        // select username and passwrod from current user.
        const { rows: user } = await query(
            'SELECT username,password from users WHERE username=$1',
            [username]
        );

        // if user doesnt exist in the database
        if (!(user && user.length > 0)) {
            return res.status(400).json({ error: 'User does not exist' });
        }

        // if user exist check password for this user
        const match = await decryptPassword(password, user[0].password);
        if (!match) {
            return res.status(400).json({
                status: 'fail',
                error: 'Invalid Password.',
            });
        }
        // user and password match
        res.status(200).json({
            status: 'success',
            user: user[0],
        });

        //error
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: 'error',
            err,
        });
    }
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
