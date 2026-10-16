// server/src/app.js
//
// Extracted from index.js so tests can import the Express app without
// binding a real port — index.js now only handles process startup
// (app.listen), not app construction.

import express from "express";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import "./events/listeners/log-published-posts.listener.js";
import "./events/listeners/count-published-posts.listener.js";

export const app = express();
app.use(express.json());
app.use("/api", healthRoutes);
app.use("/api", authRoutes);
app.use("/api", postRoutes);
app.use("/api", statsRoutes);

// Carried over from index.js (Lecture 6) — dropping this here would
// silently lose the app's JSON error-response contract.
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: status === 500 ? "An unexpected error occurred." : err.message,
    },
  });
});
