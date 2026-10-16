'use strict';

const rateLimit = require('express-rate-limit');

// In a multi-instance deployment, replace this process-local MemoryStore with a
// rate-limit-redis RedisStore so every server shares the same counters; otherwise
// each load-balanced instance would enforce a separate, bypassable limit.
module.exports = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});
