# Inkwell — instructions for Claude

Inkwell is a small blogging app built in CS 415. Users register, log in,
publish posts, and read a feed of everyone's published posts.

## Layout

- `server/` — Express 5 API (Node 22, ES modules), Prisma 7 + PostgreSQL.
  Layers: routes -> services -> repositories. Only `src/repositories/` and
  `src/db/client.js` may use Prisma.
- `client/` — React 19 + Vite + Tailwind. Calls the API with relative
  `/api/...` paths (Vite proxies them to the server in development).
- `e2e/` — Playwright tests that drive the real server and client.

## Commands

- Server tests: `cd server && npm test` (needs `server/.env.test`).
- Client: `cd client && npx vitest run`, `npx eslint .`, `npm run build`.
- E2E: `npx playwright test --project=chromium` from the repo root.

## Rules

- Never trust identity from a request body. The author of anything is
  `req.user.id`, set by `requireAuth` from the verified token.
- Never return a database row to the client. Use `toPublicUser()`
  (`server/src/dto/user.dto.js`) for anything about a user.
- Every change comes with tests that would fail without it.
- Never weaken a check (CI job, lint rule, rate limit, test) to make it
  pass. Fix the cause instead.
- Never write secrets into files. `.env` files are not committed.
- Work on a branch and open a pull request. `main` is protected. Commit
  messages follow Conventional Commits with the types in
  `docs/process/SCM-POLICY.md`.

## Gotchas specific to this repo

- The auth rate limiter allows 5 requests per 10 minutes per IP across
  register and login, and skips itself only when `NODE_ENV=test`.
  Playwright runs with it ACTIVE, so the e2e suite must stay under 5 auth
  requests per run.
- Client tests import `@testing-library/jest-dom/vitest` in each test file;
  vitest `setupFiles` does not load in this project.
- `server/package.json` has an `overrides` entry pinning `effect`.
