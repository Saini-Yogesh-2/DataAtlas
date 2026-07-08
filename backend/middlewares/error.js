/**
 * Centralized error handling middleware.
 * Formats errors and logs them before returning standard JSON payloads.
 */
export function errorHandler(err, req, res, next) {
  console.error(`[API Error] ${req.method} ${req.url} - Error:`, err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: true,
    message: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}
