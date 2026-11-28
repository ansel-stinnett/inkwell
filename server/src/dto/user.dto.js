// server/src/dto/user.dto.js
//
// Sensitive-data-exposure prevention, made structural: one function that
// defines exactly what's safe to expose about a user, so no route handler
// can leak a field by forgetting to strip it.
//
// Used everywhere a user crosses the API boundary: post authors in the
// feed and search results, and the user returned by register and login.

export function toPublicUser(user) {
  return {
    id: user.id,
    displayName: user.displayName,
    // deliberately excluded: email, passwordHash, isVerified, and any
    // future sensitive field — an allowlist, not a denylist, by design
  };
}
