// middleware/error.middleware.js

const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging

  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected error occurred on the server.";

  res.status(statusCode).json({
    success: false,
    message: message,
    // Optionally include stack trace in development mode
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;