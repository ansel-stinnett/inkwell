// server/src/index.js
//
// Entry point. This file's only job is to assemble
// middleware and mount routers — it contains no business logic itself,
// consistent with ADR-001's layered architecture.

import "dotenv/config";
import express from "express";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use("/api", healthRoutes);
app.use("/api", authRoutes);
app.use("/api", postRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      code: err.code || "INTERNAL_ERROR",
      // Unexpected failures get a generic message; the detail stays in
      // the server log. Deliberate errors (4xx) keep their message.
      message: status === 500 ? "An unexpected error occurred." : err.message,
    },
  });
});
app.listen(PORT, () => {
  console.log(`Inkwell API listening on port ${PORT}`);
});
