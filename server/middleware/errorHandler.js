const AppError = require('../utils/AppError');

function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let message = err.message || 'Server error';
  let details = err.details || null;

  if (err.name === 'ValidationError' && err.errors) {
    status = 400;
    message = 'Validation failed';
    details = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
  }
  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON body';
  }
  if (status === 500) console.error(err);

  res.status(status).json({
    success: false,
    message: status === 500 ? 'Internal server error' : message,
    details
  });
}

module.exports = { notFound, errorHandler };
