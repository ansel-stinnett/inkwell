// client/src/components/AuthProvider.jsx
//
// Keeps the signed-in user in React state so the UI re-renders when it
// changes, and mirrors it to localStorage (lib/auth.js) so it survives a
// page reload. signIn and signOut are the only ways to change it.

import { useCallback, useMemo, useState } from "react";
import { AuthContext } from "../lib/auth-context";
import { clearToken, clearUser, getUser, saveToken, saveUser } from "../lib/auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());

  const signIn = useCallback((accessToken, nextUser) => {
    saveToken(accessToken);
    saveUser(nextUser);
    setUser(nextUser);
  }, []);

  const signOut = useCallback(() => {
    clearToken();
    clearUser();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
