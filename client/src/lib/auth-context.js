// client/src/lib/auth-context.js
//
// Who is signed in, shared with every component that needs to know (the
// nav bar, the /write guard, the forms that sign you in or out). The
// provider lives in components/AuthProvider.jsx; this file holds only the
// context and its hook so React Fast Refresh can treat that file as a
// pure component module.

import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (value === null) {
    throw new Error("useAuth() must be used inside <AuthProvider>.");
  }
  return value;
}
