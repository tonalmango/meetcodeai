const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Error logging handled by Winston logger in server.js

    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = {
            statusCode: 400,
            message,
            isOperational: true
        };
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error = {
            statusCode: 400,
            message: `Duplicate field value: ${field}. Please use another value.`,
            isOperational: true
        };
    }

    if (err.name === 'CastError') {
        error = {
            statusCode: 400,
            message: `Invalid ${err.path}: ${err.value}`,
            isOperational: true
        };
    }

    if (err.name === 'JsonWebTokenError') {
        error = {
            statusCode: 401,
            message: 'Invalid token. Please log in again.',
            isOperational: true
        };
    }

    if (err.name === 'TokenExpiredError') {
        error = {
            statusCode: 401,
            message: 'Token expired. Please log in again.',
            isOperational: true
        };
    }

    res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;