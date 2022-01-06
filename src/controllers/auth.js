const { query } = require('../db');
// const ErrorResponse = require('../utils/errorResponse');
const {
    hashedPassword,
    decryptPassword,
    getSignedToken,
    getRefreshToken,
} = require('../Model/User');
const {
    RegisterValidation,
    loginValidation,
    forgotPasswordValidation,
} = require('../utils/validations');
//initial path routes: '/api/auth'

// TODO: Replace error to ErrorHandler middleware.

//register user controller
const register = async (req, res, next) => {
    // validate user data from body
    const { error } = RegisterValidation(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // hashing password
    const { username, email, password } = req.body;
    const passwordHashed = await hashedPassword(password);

    //  check if user already exists
    const { rows: userExist } = await query('SELECT id,username FROM users WHERE username = $1', [
        username,
    ]);
    if (userExist && userExist.length > 0) {
        return res.status(400).json({ error: 'User already exist' });
    }

    // check if mail already exists in the database
    const { rows: mailExist } = await query('SELECT email FROM users WHERE email = $1', [email]);
    if (mailExist && mailExist.length > 0) {
        return res.status(400).json({ error: 'Mail already exist' });
    }

    // insert new user in db
    try {
        const { rows: user } = await query(
            `INSERT INTO users (username,email,password) VALUES ($1,$2,$3) RETURNING *`,
            [username, email, passwordHashed]
        );

        //send token to register user
        sendToken(user, 201, res);

        // error
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error,
        });
    }
};

// login user controller
const login = async (req, res, next) => {
    // validate username and password from body
    const { username, password } = req.body;
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        // select username and passwrod from current user.
        const { rows: user } = await query(
            'SELECT id,username,password from users WHERE username=$1',
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

        //send jwt token session to current loged in user
        sendToken(user, 200, res);

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
    // get the email and password from body
    const { username, email } = req.body;
    const { error } = forgotPasswordValidation(req.body);
    if (error) return res.status(400).json({ status: 'fail', error: error.details[0].message });

    // find email in databse if exist.
    const { rows: userForgotPassword } = await query('SELECT email,password from users WHERE=$1', [
        username,
    ]);
    if (!(userForgotPassword && userForgotPassword.length > 0)) {
        return res.status(400).json({
            status: 'fail',
            error: 'user does not exist in the database',
        });
    }

    // TODO: if user exist, send mail with url /api/auth/forgotPassword/+jwt
};

// reset password controller
const resetPassword = async (req, res, next) => {
    res.send('forgot password route testing');
};

// send tocken controller
const sendToken = (user, statusCode, res) => {
    const [currUser] = user;
    delete currUser['password'];
    try {
        const token = getSignedToken(currUser);
        const refreshToken = getRefreshToken(currUser);
        res.status(statusCode).json({
            success: true,
            token,
            refreshToken,
        });
    } catch (error) {
        console.log(error);
    }
};
module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword,
    sendToken,
};
