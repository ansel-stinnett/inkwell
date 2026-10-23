# Inkwell Threat Model

## Attack Surface
- POST /api/auth/register — unauthenticated, accepts email/displayName/password
- POST /api/auth/login — unauthenticated, accepts email/password
- POST /api/posts — accepts title/body/tagNames/authorId
- GET /api/posts — unauthenticated, returns paginated feed
- GET /api/stats — unauthenticated, returns published-post counter
- JWT access tokens — bearer, sent in Authorization header

## STRIDE Analysis, with Risk Rating

| Component | Threat | Category | Likelihood | Impact | Risk Rating | Mitigation |
|---|---|---|---|---|---|---|
| POST /api/posts | A user forges another user's authorId to publish as them | Spoofing | High | High | Critical | Derive author from the authenticated token, never trust client-supplied authorId |
| GET /api/posts | Response includes fields beyond what the feed needs (e.g. author email) | Information Disclosure | High | Medium | High | Explicit response shaping / DTO |
| POST /api/auth/login | Unlimited login attempts enable brute-force credential guessing | Denial of Service / Broken Auth | Medium | High | High | Rate limiting |
| POST /api/posts | Untrusted body content rendered unsanitized on the client, enabling stored XSS | Tampering / Info Disclosure | Medium | High | High | Output encoding on render |
| GET /api/posts | Unbounded pageSize lets one request pull the entire posts table | Denial of Service | Medium | Medium | Medium | Clamp pageSize to a maximum |

## Hardening Log
- 2026 — Lecture 15: Added requireAuth middleware; the server had never
  verified tokens despite issuing them since Lecture 6
- 2026 — Lecture 15: Fixed authorId spoofing — POST /api/posts now derives
  the author from the verified token and ignores any authorId in the body
- 2026 — Lecture 15: Added allowlist-based user DTO to prevent author field
  leakage in feed and search responses
- 2026 — Lecture 15: Added rate limiting to both auth endpoints
- 2026 — Lecture 15: Clamped pageSize on GET /api/posts to a maximum of 50
- 2026 — Lecture 15: Verified stored-XSS resistance with a regression test

## Security Measurement Baseline
- Vulnerabilities found this pass: 5 (all remediated)
- Security regression tests added: 4 (spoofing, missing token, oversized
  pageSize, negative pageSize) plus 1 client-side XSS test
- Maturity note: Inkwell's security practice is currently ad hoc/reactive —
  a single hardening pass, not an ongoing program. This is the honest,
  named starting point for future improvement, not a finished state.

## Note on the rate limiter
authRateLimiter is skipped when NODE_ENV=test. The Playwright suite
registers a fresh account per viewport on every run, so a 5-per-10-minutes
limit would throttle the test suite against itself within two runs. The
limit is active in development and would be active in production; only the
test environment bypasses it. The tradeoff is that no automated test covers
the limiter's behaviour — it is verified manually.
