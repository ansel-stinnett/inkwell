# Inkwell Defect Log

| ID | Found During | Cause Category | Description | Remediation |
|----|--------------|----------------|-------------|-------------|
| D-001 | Lecture 10 review | Compatibility | Nullish-coalescing assignment used without a documented minimum Node version | Added engines field to server/package.json |
| D-002 | Lecture 8 manual verification | Incomplete change | AuthService.login() returned the raw user record including passwordHash; the toPublicUser() projection added in Lecture 7 was applied to register() only. Hidden by the in-memory store, exposed once real Postgres returned every column. | Wrapped login()'s return in toPublicUser(); verified by re-running the login request |
