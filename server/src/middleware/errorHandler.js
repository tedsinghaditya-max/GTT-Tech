export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  const status = error.status || 500;

  res.status(status).json({
    message: error.message || "Something went wrong",
    ...(process.env.NODE_ENV !== "production" ? { stack: error.stack } : {})
  });
}

