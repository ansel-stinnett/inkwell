# Review: Real PostgreSQL Persistence and Mobile-First Layout (Lecture 8)

**Reviewer prep time:** ~20 minutes
**Defects found:** 2
**Outcome:** Accept after fixing the first one

## What I found

### 1. Login was sending back the password hash (fixed)

I was comparing the register response to the login response and noticed they
weren't the same shape. Register returns just id, email, and displayName. Login
was returning all of that plus passwordHash, isVerified, and createdAt.

The reason is that register wraps its result in toPublicUser() and login doesn't.
I wrote that projection in Lecture 7 but only applied it to one of the two paths.
It didn't show up until this lecture because the in-memory store wasn't returning
the full record — real Postgres gives you every column, so the bug became visible
the moment I swapped the storage engine.

Fix was one line: wrapping login's return in toPublicUser() the same way register
does. I re-ran the login curl afterward and the hash is gone.

### 2. Publishing from the browser still fails (leaving it)

PostEditor doesn't send an authorId, so the foreign key rejects the insert. This
is supposed to get fixed in Lecture 15 when the auth middleware pulls identity
out of the token, so I'm not treating it as a defect for this increment. Writing
it down so I don't spend time on it again thinking something's broken.

## Other notes

The thing that actually worked well: swapping from the in-memory stub to real
Postgres only meant editing src/db/client.js. I didn't touch AuthService,
PostService, either repository, or any of the routes. That's the layered
architecture doing what ADR-001 said it would.

Defect 1 is kind of the flip side of that. The layers held up fine, but having
the same projection on one path and not the other isn't something the
architecture protects you from.
