// User functions related
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
const getSignedTocken = (username, id) => {
    return jwt.sign(
        {
            id,
            username,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

module.exports = { hashedPassword, decryptPassword, getSignedTocken };
