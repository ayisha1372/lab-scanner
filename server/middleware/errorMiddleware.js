exports.notFound = (req, res) =>
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message;

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join('. ');
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0];
    message =
      field === 'admissionNo' ? 'That admission number already exists'
      : field === 'systemNumber' ? 'That system number already exists'
      : field === 'username' ? 'That username already exists'
      : 'Duplicate value';
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid value';
  }

  if (status >= 500) {
    console.error(err);
    message = 'Something went wrong on the server';
  }
  res.status(status).json({ message });
};
