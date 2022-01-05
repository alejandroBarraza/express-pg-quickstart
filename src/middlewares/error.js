const ErrorResponse = require('../utils/errorResponse');

// error handler middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    console.log(err);

    res.status(error.statusCode).json({
        success: false,
        error: error.message || 'Error server 500',
    });
};

module.exports = errorHandler;
