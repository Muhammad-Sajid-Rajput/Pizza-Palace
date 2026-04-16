import rateLimit from 'express-rate-limit';

const defaultHandler = (req, res) => {
  res.status(429).json({
    message: 'Too many requests, please try again later.'
  });
};

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: defaultHandler
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: defaultHandler
});
