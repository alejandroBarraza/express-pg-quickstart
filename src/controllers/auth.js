const { query } = require('../db');
require('dotenv').config();
// const ErrorResponse = require('../utils/errorResponse');
const {
    hashedPassword,
    decryptPassword,
    getSignedToken,
    getRefreshToken,
    getResetPasswordToken,
} = require('../Model/User');
const sendMail = require('../utils/sendEmail');
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
        // Select username and password from current user.
        const { rows: user } = await query(
            'SELECT id,username,password from users WHERE username=$1',
            [username]
        );

        // If user doesnt exist in the database.
        if (!(user && user.length > 0)) {
            return res.status(400).json({ error: 'User does not exist' });
        }

        // If user exist check password for this user
        const match = await decryptPassword(password, user[0].password);
        if (!match) {
            return res.status(400).json({
                status: 'fail',
                error: 'Invalid Password.',
            });
        }

        //Send jwt token session to current loged in user.
        sendToken(user, 200, res);

        //Error
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: 'error',
            err,
        });
    }
};

// Forgot password controller.
const forgotPassword = async (req, res, next) => {
    // get the email and password from body
    const { email } = req.body;
    const { error } = forgotPasswordValidation(req.body);
    if (error) return res.status(400).json({ status: false, error: error.details[0].message });

    try {
        // Find email in databse if exist.
        const { rows: user } = await query('SELECT email FROM users WHERE email = $1', [email]);
        if (!(user && user.length > 0)) {
            return res.status(400).json({
                status: 'fail',
                error: 'Mail does not exist for the user',
            });
        }

        // Get resetPassword Token and Expire time token.
        const [resetPasswordToken, resetPasswordExpire] = getResetPasswordToken();
        await query(
            `UPDATE users SET "resetPasswordToken" = $1, resetpasswordexpire = to_timestamp(${resetPasswordExpire}/1000)  WHERE email = $2 returning *`,
            [resetPasswordToken, user[0].email]
        );

        // Send email with url to nodemailer and sendgrid.
        const urlResetPassword = `${process.env.PUBLIC_URL}/password-resset/${resetPasswordToken}`;

        const message = `
        <h1>you have requestes a new password resset</h1>
        <p>plase go to this link to reset your password</p>
        <a href='${urlResetPassword}  clicktracking='off'> ${urlResetPassword} </a>
        
        `;

        // Send to nodemailes with the message.
        try {
            await sendMail({
                to: user[0].email,
                subject: 'Reset password',
                html: message,
            });

            res.status(200).json({
                success: true,
                message: 'Message has been sent 📩',
            });
        } catch (error) {
            // Reset token and expire time for current user.
            await query(
                `UPDATE users SET "resetPasswordToken" = $1, resetpasswordexpire = to_timestamp(${resetPasswordExpire}/1000)  WHERE email = $2 returning *`,
                [resetPasswordToken, user[0].email]
            );

            console.log(error);
            res.status(400).json({
                success: false,
                error,
            });
        }

        // Error.
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success: false,
            error,
        });
    }
};

// Reset password controller.
const resetPassword = async (req, res, next) => {
    res.send('forgot password route testing');
};

// Send tocken controller.
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
