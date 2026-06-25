import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: process.env.NODE_ENV === 'development' ? 100 : 5, // Higher limit in development to allow integration tests to run
  message: {
    status: 'error',
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100, // General rate limit of 100 requests per IP per window
  message: {
    status: 'error',
    message: 'Too many requests from this IP address. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
