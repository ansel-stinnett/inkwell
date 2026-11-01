# OWASP Top 10 Review — Lecture 16

| # | Category | Status in Inkwell | Action |
|---|---|---|---|
| A01 | Broken Access Control | Found: no ownership check existed because no delete route existed; added DELETE /api/posts/:id with an ownership guard | Fixed |
| A02 | Cryptographic Failures | Passwords hashed with bcrypt since Lecture 6; found: JWT secrets were falling back to hardcoded dev strings | Fixed |
| A03 | Injection | Prisma's parameterized queries prevent SQL injection by default; no raw SQL anywhere in the codebase | Verified only |
| A04 | Insecure Design | Covered by Lecture 15's STRIDE threat model; no new gap this pass | No action needed |
| A05 | Security Misconfiguration | Error handler already genericized 500s; extracted to its own middleware and added the NODE_ENV production check | Fixed |
| A06 | Vulnerable/Outdated Components | npm audit run; non-breaking fixes applied, remainder documented below | Partially fixed, documented |
| A07 | Authentication Failures | Rate limiting added in Lecture 15 | No new action needed |
| A08 | Software/Data Integrity | Deferred to Lecture 20/21's pipeline integrity discussion | Deferred |
| A09 | Logging/Monitoring Failures | Found: no logging on failed logins; added structured pino logging on both failure paths | Fixed |
| A10 | SSRF | Not applicable — no feature fetches a user-supplied URL; flagged for when avatar-by-URL is built | Flagged for future |

## A06 detail

`npm audit fix` resolved the non-breaking findings, including a critical
IP-spoofing issue in proxy-addr (an Express dependency) and high-severity
issues in body-parser and mysql2.

The remaining findings sit in the deepmerge / glob / minimatch chain inside
Jest's own tooling. npm reports they resolve only by installing jest@25.1.0 —
a four-major-version downgrade of the test framework. These are dev-time-only
dependencies that never run in production, so the downgrade costs more than it
buys. Documented rather than forced.

## Note on test isolation

Adding the access-control suite surfaced a flaky test: Jest's parallel workers
share one test database, so resetDatabase() in one suite wiped rows another
suite was mid-way through asserting on. Fixed with --runInBand, which runs
suites sequentially. The tradeoff is a slower suite; the alternative, a
separate database per worker, is more machinery than this project needs.
