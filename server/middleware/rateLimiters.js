const rateLimit = require('express-rate-limit');

// Brute-force protection for both login endpoints.
// Lab PCs share one network, so the limit is per IP and fairly generous.
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Wait a few minutes and try again.' },
});
