const rateLimit = require('express-rate-limit');

/**
 * Rate limiter: 100 requests per 15-minute window per IP.
 * In production, swap the default memory store with Redis store
 * for distributed rate limiting across multiple server instances.
 *
 * Example Redis store:
 *   const { RedisStore } = require('rate-limit-redis');
 *   store: new RedisStore({ client: redisClient })
 */
module.exports = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // Max requests per window per IP
  standardHeaders: true,     // Return RateLimit-* headers (RFC 6585)
  legacyHeaders: false,      // Disable X-RateLimit-* headers
  message: {
    success: false,
    message:
      'Too many requests from this IP. Please try again after 15 minutes.',
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});
