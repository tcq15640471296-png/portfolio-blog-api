/**
 * Central error handling middleware.
 * ---------------------------------------------------------------
 * Every error — thrown in a controller, produced by Mongoose validation,
 * or caused by a bad ObjectId — is normalised into ONE consistent JSON shape:
 *
 *   { "success": false, "message": "...", "errors": [ ... ] }
 *
 * Controllers simply do `res.status(400); throw new Error('...')`.
 */

const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode >= 400 ? res.statusCode : 500;
  let message = err.message || 'Server Error';
  let errors;

  // Mongoose: invalid ObjectId (e.g. /api/projects/123)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = `Resource not found (invalid id: ${err.value})`;
  }

  // Mongoose: schema validation failed
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongo: duplicate key (unique username / email)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || { field: '' })[0];
    message = `Duplicate value for field: ${field}. Please use another value.`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};

module.exports = { notFound, errorHandler };
