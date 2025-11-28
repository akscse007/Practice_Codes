// backend/middlewares/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error(err.stack || err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  // Hide stack trace in production
  const payload = {
    success: false,
    message,
  };
  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
    payload.details = err.details || null;
  }
  res.status(statusCode).json(payload);
};
