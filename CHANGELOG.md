# Changelog

All notable changes to Inkwell are recorded here.

## [0.5.0] - 2026-11-06

### Added

- User registration and login with JWT access and refresh tokens
- Post creation, publishing, and a paginated public feed
- Tag-based posts with a many-to-many data model
- Keyword search over published posts, behind a pluggable search strategy
- In-process event bus with listeners for post publication and a stats counter
- Post deletion restricted to the post's author
- Mobile-first responsive layout across mobile, tablet, and desktop widths

### Fixed

- Login responses leaked the bcrypt password hash; the public-user projection
  had been applied to registration only
- Publishing from the browser failed because the editor never sent an author
  id, which only an end-to-end test could surface
- No page carried an `h1` heading after the Lecture 7 router rewrite

### Security

- Broken access control: post deletion now verifies ownership, not just
  authentication
- Author spoofing: the server derives the author from the verified token and
  ignores any client-supplied author id
- Weak secrets: JWT signing keys moved out of hardcoded fallbacks into
  generated per-environment values
- Information disclosure: feed and search responses shape embedded author data
  through an allowlist DTO
- Rate limiting on both authentication endpoints
- Unbounded page size on the feed endpoint, now clamped
- Failed login attempts are logged as structured events
- Error responses no longer expose internal messages in production

### Testing

- Unit tests for services (Jest)
- Integration tests against an isolated test database (Supertest)
- Component tests (React Testing Library + Vitest)
- End-to-end tests across three viewports (Playwright)
- Automated accessibility checks (axe-core)
