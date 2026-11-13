# Inkwell SCM Policy

## Branching Strategy

Inkwell uses GitHub Flow:

- `main` is always deployable.
- All work happens on short-lived branches named `<type>/<short-description>`,
  such as `feature/tag-search` or `fix/author-id-spoofing`.
- Contributors merge branches through pull requests that require:
  - All automated tests to pass
  - At least one reviewer to approve the change
- Contributors delete branches after merging them.

GitHub Flow fits the course's one-lecture-one-increment pace. A project this
size does not need the overhead of synchronizing long-lived `develop` and
`main` branches, and GitHub Flow is what the CI work in Lecture 20 assumes.

### Current deviation

This project has a single contributor, so no pull request has had a second
reviewer: GitHub does not let an author approve their own pull request, and the
branch protection rule recorded below therefore requires zero approvals. That
remains a real gap, not a solved problem — recording it is more useful than
pretending otherwise.

Commits through Lecture 19 went directly to `main`. From Lecture 20 onward they
cannot: every other part of this policy is now enforced mechanically.

## Commit Message Conventions

Inkwell follows Conventional Commits:

    <type>(<scope>): <short summary>

Types: feat, fix, test, docs, refactor, chore, security

Examples:

    feat(posts): add tag-based search
    security(auth): fix authorId spoofing vulnerability

A consistent `<type>(<scope>)` prefix makes the history searchable:
`git log --grep="^security"` finds every security-related change. That turns
the commit log into an audit trail rather than a list to scroll through.

Commits before Lecture 17 use the type prefix but not consistently the scope,
and two early commits predate the convention entirely. History is not being
rewritten; the convention applies from here forward.

## CI Enforcement (Lecture 20)

`main` is a protected branch:

- Required status checks: `dependency-audit`, `server-tests`, `client-tests`,
  `e2e-tests`, `docker-build`
- No direct pushes to `main`; every change arrives by pull request
- Branches must be up to date with `main` before merging
- The rule applies to administrators too

This turns Lecture 17's "`main` is always deployable" from a documented
intention into a mechanically enforced guarantee: a pull request cannot merge
until every required check has passed.
