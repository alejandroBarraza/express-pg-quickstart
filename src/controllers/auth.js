const { query } = require('../db')
require('dotenv').config()
const crypto = require('crypto')
const { OAuth2Client } = require('google-auth-library')
const {
    hashedPassword,
    decryptPassword,
    getSignedToken,
    getRefreshToken,
    getResetPasswordToken,
} = require('../Model/User')
const sendMail = require('../utils/sendEmail')
const {
    RegisterValidation,
    loginValidation,
    forgotPasswordValidation,
} = require('../utils/validations')

// TODO: Replace error to ErrorHandler middleware.
// const ErrorResponse = require('../utils/errorResponse');
//initial path routes: '/api/auth'

//Register user controller
const register = async (req, res, next) => {
    // Validate user data from body.
    const { error } = RegisterValidation(req.body)
    if (error) return res.status(400).json({ error: error.details[0].message })

    // Hashing password
    const { username, email, password } = req.body
    const passwordHashed = await hashedPassword(password)

    //  Check if user already exists.
    const { rows: userExist } = await query('SELECT id,username FROM users WHERE username = $1', [
        username,
    ])
    if (userExist && userExist.length > 0) {
        return res.status(400).json({ success: false, error: `User ${username} already exist` })
    }

    // Check if mail already exists in the database.
    const { rows: mailExist } = await query('SELECT email FROM users WHERE email = $1', [email])
    if (mailExist && mailExist.length > 0) {
        return res
            .status(400)
            .json({ success: false, error: `An account with email ${email} already exist` })
    }

    // Insert new user in db.
    try {
        const { rows: user } = await query(
            `INSERT INTO users (username,email,password) VALUES ($1,$2,$3) RETURNING *`,
            [username, email, passwordHashed]
        )

        //Send token to register user.
        sendToken(user, 201, res)

        // Error
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'error',
            error,
        })
    }
}

// Login user controller.
const login = async (req, res, next) => {
    // validate username and password from body.
    const { username, password } = req.body
    const { error } = loginValidation(req.body)
    if (error) return res.status(400).json({ error: error.details[0].message })

    try {
        // Select username and password from current user.
        const { rows: user } = await query(
            'SELECT id,username,password from users WHERE username=$1',
            [username]
        )

        // If user doesnt exist in the database.
        if (!(user && user.length > 0)) {
            return res.status(400).json({ error: 'User does not exist' })
        }

        // If user exist check password for this user
        const match = await decryptPassword(password, user[0].password)
        if (!match) {
            return res.status(400).json({
                status: 'fail',
                error: 'Invalid Password.',
            })
        }

        //Send jwt token session to current loged in user.
        sendToken(user, 200, res)

        //Error
    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: 'error',
            err,
        })
    }
}

// Forgot password controller.
const forgotPassword = async (req, res, next) => {
    // get the email and password from body
    const { email } = req.body
    const { error } = forgotPasswordValidation(req.body)
    if (error) return res.status(400).json({ status: false, error: error.details[0].message })

    try {
        // Find email in databse if exist.
        const { rows: user } = await query('SELECT email FROM users WHERE email = $1', [email])
        if (!(user && user.length > 0)) {
            return res.status(400).json({
                status: 'fail',
                error: 'Mail does not exist for the user',
            })
        }

        // Get resetPassword Token and Expire time token.
        const [resetToken, resetPasswordToken, resetPasswordExpire] = getResetPasswordToken()
        await query(
            `UPDATE users SET resetpasswordtoken = $1, resetpasswordexpire = to_timestamp(${resetPasswordExpire}/1000)  WHERE email = $2 returning *`,
            [resetPasswordToken, user[0].email]
        )

        // Send email with url to nodemailer and sendgrid.
        const urlResetPassword = `${process.env.PUBLIC_URL}/reset-password/${resetToken}`

        const message = `
        <h1>you have requestes a new password resset</h1>
        <p>plase go to this link to reset your password</p>
        <a href=${urlResetPassword} clicktracking=off > ${urlResetPassword} </a>
        
        `

        // Send to nodemailes with the message.
        try {
            await sendMail({
                to: user[0].email,
                subject: 'Reset password',
                html: message,
            })

            res.status(200).json({
                success: true,
                message: 'Message has been sent 📩',
            })
        } catch (error) {
            // Reset token and expire time for current user.
            await query(
                `UPDATE users SET resetpasswordtoken = $1, resetpasswordexpire = to_timestamp(${resetPasswordExpire}/1000)  WHERE email = $2 returning *`,
                [resetPasswordToken, user[0].email]
            )

            console.log(error)
            res.status(400).json({
                success: false,
                error,
            })
        }

        // Error.
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            error,
        })
    }
}

// Reset password controller.
const resetPassword = async (req, res, next) => {
    const { password } = req.body
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex')

    // Check if resetPasswordToken from url is same as in the db.
    try {
        const { rows: userReset } = await query(
            `SELECT * from users WHERE resetpasswordtoken =$1`,
            [resetPasswordToken]
        )

        // Check if query return any user with this token.
        if (!(userReset && userReset.length > 0)) {
            return res.status(400).json({
                status: 'fail',
                error: 'Does not exist user with given token. ',
            })
        }

        // If user exist, update his/her password,token and expire date.
        // hash password.
        const passwordHashed = await hashedPassword(password)
        const { rows: user } = await query(
            `UPDATE users SET password = $1, resetpasswordtoken = $2, resetpasswordexpire = $3  WHERE resetpasswordtoken = $4 AND resetpasswordexpire > now() returning *`,
            [passwordHashed, null, null, resetPasswordToken]
        )

        res.status(201).json({
            success: true,
            message: 'user password updated',
            user,
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            success: false,
            error,
        })
    }
}

const loginGoogle = async (req, res, next) => {
    const client = new OAuth2Client(process.env.CLIENT_ID)
    const { tokenId: token } = req.body
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID,
        })
        const { name: username, email, sub } = ticket.getPayload()

        // check in db if user exist
        const { rows: user } = await query(`SELECT email,googleId FROM users WHERE email = $1`, [
            email,
        ])

        // if user email exist and has no google id , return already exist
        if (user[0]?.email && user[0]?.googleid === null) {
            return res.status(400).json({
                success: false,
                error: `An account with email ${email} already exist`,
            })
        } else if (user[0]?.email && user[0]?.googleid) {
            // if user email exist and has google id, return values
            res.status(200).json({
                success: true,
                dataUser: {
                    username,
                    email,
                },
            })
        } else {
            // if user email does not exist, create the user
            const password = crypto.randomBytes(6).toString('hex')
            const passwordHashed = await hashedPassword(password)
            await query(
                `INSERT INTO users (username,email,password,googleid) VALUES ($1,$2,$3,$4) RETURNING *`,
                [username, email, passwordHashed, sub]
            )
            res.status(201).json({
                dataUser: {
                    username,
                    email,
                },
            })
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({
            success: false,
            error,
        })
    }
}

// Send tocken controller.
const sendToken = (user, statusCode, res) => {
    const [currUser] = user
    delete currUser['password']
    try {
        const token = getSignedToken(currUser)
        const refreshToken = getRefreshToken(currUser)
        const userData = {
            username: currUser.username,
            token,
            refreshToken,
        }
        res.status(statusCode).json({
            success: true,
            userData,
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error })
    }
}
module.exports = {
    register,
    login,
    loginGoogle,
    forgotPassword,
    resetPassword,
    sendToken,
}
