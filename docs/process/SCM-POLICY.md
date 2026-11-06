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

Through Lecture 17 this project has had a single contributor, so commits have
gone directly to `main` and no pull request has had a second reviewer. The
policy above describes how the project is run once there is more than one
contributor; recording the gap is more useful than pretending it isn't there.

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
