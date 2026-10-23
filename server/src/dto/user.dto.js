// server/src/dto/user.dto.js
//
// Sensitive-data-exposure prevention, made structural: one function that
// defines exactly what's safe to expose about ANOTHER user, so no route
// handler can leak a field by forgetting to strip it.
//
// Distinct from AuthService's own toPublicUser, which shapes the
// authenticated user's view of themselves and may include their email.
// This one is for other people's data embedded in public responses.

export function toPublicUser(user) {
  return {
    id: user.id,
    displayName: user.displayName,
    // deliberately excluded: email, passwordHash, isVerified, and any
    // future sensitive field — an allowlist, not a denylist, by design
  };
}
