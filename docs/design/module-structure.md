# Inkwell Server Module Structure — v1

## Routes / Controllers (boundary classes)
- Receive HTTP requests, call the correct service, return HTTP responses.
- Never query Prisma or the database directly.

## Services
- **AuthService** (pure fabrication) — password hashing, verification, token issuance.
- **PostService** (controller/coordinator) — business rules for posts: duplicate checks, ownership, draft/published transitions.

## Repositories (persistence classes)
- **UserRepository**, **PostRepository** — the only modules that talk to Prisma / the database directly.

## Dependency flow
