function errorHandler(err, req, res, next) {
  console.error('[Error]', err.message || err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ code: status, message, data: null });
}

module.exports = { errorHandler };
