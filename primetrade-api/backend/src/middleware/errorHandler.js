const logger = require('../utils/logger');

/**
 * Centralized error handler — must be registered LAST in Express.
 * Handles both operational errors (known status codes) and
 * unexpected programming errors (500s).
 */
// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  // Log all errors with context
  logger.error(`${req.method} ${req.path} — ${err.message}`, {
    statusCode: err.statusCode,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  const statusCode = err.statusCode || 500;

  // Don't leak internal error details in production
  const message =
    err.statusCode
      ? err.message
      : process.env.NODE_ENV === 'development'
      ? err.message
      : 'An unexpected error occurred. Please try again.';

  const body = { success: false, message };

  if (process.env.NODE_ENV === 'development' && !err.statusCode) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
};
