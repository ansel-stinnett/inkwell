# Inkwell SQA Plan — v1

## Standards
- All code changes follow the PR checklist (.github/PULL_REQUEST_TEMPLATE.md)
- Architecture conformance per ADR-001 (docs/architecture/adr-001-modular.monolith.md)
- API contract conventions per docs/design/api-contract.md

## Reviews
- Every merged change is self-reviewed by the author against the PR checklist
- Peer review before merge once the project has a second contributor; until then,
  self-review is the only review stage that actually happens
- Review findings logged in docs/reviews/

## Testing (expanded in Lectures 12-14)
- Unit tests: Services (Jest) — ACTIVE (Lecture 12)
- Integration tests: Routes → Services → Repositories, real test DB
  (Supertest) — ACTIVE (Lecture 13)
- Component tests: React components (RTL + Vitest) — ACTIVE (Lecture 13)
- End-to-end tests: critical user flows, mobile + tablet + desktop viewports
  (Playwright) — ACTIVE (Lecture 14)
- Automated accessibility checks (axe-core) — ACTIVE (Lecture 14)
- Documentation verification (README) — ACTIVE (Lecture 14)
- Security testing — starting Lecture 15
- Performance/load testing — deferred; revisit at Lecture 19-20
## Defect Tracking
- All discovered defects (via review, testing, or manual use) recorded in
  docs/quality/DEFECT-LOG.md
- Each entry records: cause category, discovery stage, and remediation

## Metrics Tracked
- Defects per lecture/increment
- Defect cause category distribution
- Review turnaround (informal, tracked qualitatively at this project's scale)

## Metrics Snapshot (as of Lecture 11)
- Commits on main: 16
- Logged defects: 2
- Backlog items at "Requirements Defined" or later: 4 (US-01 through US-04)

## Ownership
- For this course project: I own SQA plan adherence as the sole contributor.
