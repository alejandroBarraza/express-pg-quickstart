const bcrypt = require('bcrypt');

// return password salt hashed.
const hashedPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
};

module.exports = hashedPassword;
