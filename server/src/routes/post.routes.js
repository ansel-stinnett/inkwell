// server/src/routes/post.routes.js
//
// Wires PostService's publish(), listPublished() and search() to
// the API contract's POST /api/posts and GET /api/posts (Lecture 4).
// Same thin-route discipline as auth.routes.js: no business rules here.

import { Router } from "express";
import { PostService } from "../services/post.service.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 10;

router.post("/posts", requireAuth, async (req, res) => {
  try {
    // Never trust client-supplied identity fields — authorId comes from
    // the verified JWT, not the request body. Destructuring the specific
    // fields we accept means a forged authorId in the body is ignored
    // rather than merged in.
    const { title, body, tagNames } = req.body;
    const post = await PostService.publish({
      authorId: req.user.id,
      title,
      body,
      tagNames,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({
      error: { code: err.code || "VALIDATION_ERROR", message: err.message },
    });
  }
});

// One endpoint, two behaviours: an optional ?search= filters the same
// paginated list rather than introducing a parallel /api/search route.
//
// pageSize is clamped, not merely defaulted: an unbounded client-supplied
// pageSize lets a single request pull the entire posts table, which is the
// Denial of Service row in the threat model.
router.get("/posts", async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const requested = Number(req.query.pageSize) || DEFAULT_PAGE_SIZE;
    const pageSize = Math.min(Math.max(requested, 1), MAX_PAGE_SIZE);
    const { search } = req.query;
    const result = search
      ? await PostService.search({ query: search, page, pageSize })
      : await PostService.listPublished({ page, pageSize });
    res.status(200).json({ ...result, pageSize });
  } catch (err) {
    next(err);
  }
});

export default router;
