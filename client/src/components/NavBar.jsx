// client/src/components/NavBar.jsx
//
// Base (unprefixed) classes target mobile first.
// md: and lg: prefixes layer on enhancements for larger viewports —
// never the reverse.
//
// Shows only the links that make sense for the current visitor: Log in and
// Register when signed out; Write, who you are, and Log out when signed in.

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context";

export function NavBar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `text-sm ${isActive ? "font-semibold text-indigo-600" : "text-gray-600"}`;

  function handleLogout() {
    signOut();
    navigate("/");
  }

  return (
    <nav className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-gray-200">
      <span className="flex items-center gap-2 font-bold text-lg">
        <img src="/favicon.svg" alt="" className="h-6 w-6" />
        Inkwell
      </span>
      <div className="flex flex-wrap items-center gap-4">
        <NavLink to="/" end className={linkClass}>Feed</NavLink>
        {user ? (
          <>
            <NavLink to="/write" className={linkClass}>Write</NavLink>
            <span className="text-sm text-gray-600">Signed in as {user.displayName}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[44px] text-sm text-gray-600 underline"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={linkClass}>Log in</NavLink>
            <NavLink to="/register" className={linkClass}>Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
