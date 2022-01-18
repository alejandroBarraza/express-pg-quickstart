// User functions related
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Return password salt hashed from current user
const hashedPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
};

// Decrypted password from database from current user.
const decryptPassword = async (password, encryptedPassword) => {
    password = await bcrypt.compare(password, encryptedPassword);
    return password;
};

// Get username and id from current user, sigin it and return a token
const getSignedToken = (user) => {
    return jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// Get refresh token for current user.
const getRefreshToken = (user) => {
    return jwt.sign({ user }, process.env.JWT_REFRESH);
};

// Get ResetPassword token for current user
const getResetPasswordToken = () => {
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // current time + 10 min
    const resetPasswordExpire = Date.now() + 10 * (60 * 1000);
    // const resetPasswordExpire = Date.now();
    return [resetPasswordToken, resetPasswordExpire];
};

module.exports = {
    hashedPassword,
    decryptPassword,
    getSignedToken,
    getRefreshToken,
    getResetPasswordToken,
};
