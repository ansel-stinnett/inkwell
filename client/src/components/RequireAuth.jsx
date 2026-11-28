// client/src/components/RequireAuth.jsx
//
// Route guard: pages that only make sense signed in (/write) send a
// signed-out visitor to /login instead of letting them fill in a form the
// server will reject. The server's requireAuth is still the real check.

import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context";

export function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
