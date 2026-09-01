# Inkwell API Contract — v1

All endpoints are prefixed with `/api`. Every error response uses the shape:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "A clear explanation"
  }
}
```

---

## POST /api/auth/register

```
Request: { email: string, displayName: string, password: string }
Success: 201 { user: UserPublic, accessToken: string, refreshToken: string }
Errors:
  400 EMAIL_ALREADY_REGISTERED  — "This email is already registered."
  400 WEAK_PASSWORD             — "Password does not meet strength requirements."
```

Maps to: Register Account (US-01)

---

## POST /api/auth/login

```
Request: { email: string, password: string }
Success: 200 { user: UserPublic, accessToken: string, refreshToken: string }
Errors:
  401 INVALID_CREDENTIALS       — "Invalid email or password."
```

Maps to: Log In (US-02)

---

## GET /api/posts?page=n

```
Request: none (page supplied as a query parameter)
Success: 200 { posts: PostPublic[], page: number, hasMore: boolean }
```

Maps to: Browse Feed (US-04)
---

## POST /api/posts/:id/comments

```
Request: { body: string }
Success: 201 { comment: CommentPublic }
Errors:
  400 EMPTY_COMMENT_BODY   — "Comment body cannot be empty."
  400 COMMENT_TOO_LONG     — "Comment exceeds the maximum length."
  401 NOT_AUTHENTICATED    — "You must be logged in to comment."
  404 POST_NOT_FOUND       — "Post not found."
```

Maps to: Comment on a Post (US-05)
