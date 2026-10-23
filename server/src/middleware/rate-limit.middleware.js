// server/src/middleware/rate-limit.middleware.js

import rateLimit from "express-rate-limit";

// Security requirement, enforced in code: "the system shall reject login
// attempts after five consecutive failures from the same source within ten
// minutes."
//
// Disabled when NODE_ENV=test so the e2e suite, which registers a fresh
// account per viewport on every run, isn't throttled by its own traffic.
export const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { error: { code: "TOO_MANY_ATTEMPTS", message: "Too many attempts. Try again later." } },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
});
