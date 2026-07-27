import config from '../config/index.mjs';

export class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Wraps an async Express handler to automatically catch rejected promises
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

export function globalErrorHandler(err, req, res, _next) {
    const statusCode = err.statusCode || 500;
    const isOperational = err.isOperational || false;

    // Log all errors
    if (statusCode >= 500) {
        console.error(`[Error] ${req.method} ${req.path} →`, err.message);
        if (!config.isProduction) {
            console.error(err.stack);
        }
    } else {
        console.warn(`[Warn] ${req.method} ${req.path} → ${statusCode}: ${err.message}`);
    }

    const response = {
        error: isOperational || !config.isProduction
            ? err.message
            : 'Internal server error',
    };

    if (!config.isProduction && err.stack) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
}
