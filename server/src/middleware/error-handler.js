// server/src/middleware/error-handler.js
//
// A05's fix: never expose stack traces or internal error details to the
// client in production — log them internally instead (A09).

import { logger } from "../lib/logger.js";

export function errorHandler(err, req, res, next) {
  logger.error({ event: "request.error", err }, "Unhandled request error");

  const isProd = process.env.NODE_ENV === "production";
  const status = err.status || 500;

  res.status(status).json({
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: status === 500 && isProd ? "Something went wrong." : err.message,
    },
  });
}
