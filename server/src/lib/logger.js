// server/src/lib/logger.js
//
// Structured logging, made concrete: one shared logger instance,
// configured once, used everywhere — not a scattered mix of
// console.log/warn/error calls with no consistent shape.

import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});
