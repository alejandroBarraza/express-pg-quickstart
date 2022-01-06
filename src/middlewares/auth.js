// jwt protected route middleware.
require('dotenv').config();
const jwt = require('jsonwebtoken');

const protected = async (req, res, next) => {
    //check token in req.headers
    const hasToken = req.headers.authorization && req.headers.authorization.startsWith('Bearer');
    if (!hasToken) return res.status(401).json({ succes: false, message: 'Unauthorize user' });

    // save token
    const token = req.headers.authorization.split(' ')[1];

    //  decode token and verfy
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

        // catch error
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Token not valid',
            error,
        });
    }
};

module.exports = {
    protected,
};
