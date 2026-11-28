// client/src/lib/auth.js
//
// Minimal token and user storage in localStorage. Components sign in and
// out only through useAuth() (lib/auth-context.js), never by calling the
// save/clear functions here, so the UI re-renders when the user changes. The stored user is only
// for display; the server derives identity from the token alone.

const TOKEN_KEY = "inkwell_access_token";
const USER_KEY = "inkwell_user";

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}
