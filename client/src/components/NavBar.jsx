// client/src/components/NavBar.jsx
//
// Base (unprefixed) classes target mobile first.
// md: and lg: prefixes layer on enhancements for larger viewports —
// never the reverse.

import { NavLink } from "react-router-dom";

export function NavBar() {
  const linkClass = ({ isActive }) =>
    `text-sm ${isActive ? "font-semibold text-indigo-600" : "text-gray-600"}`;

  return (
    <nav className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
      <span className="flex items-center gap-2 font-bold text-lg">
        <img src="/favicon.svg" alt="" className="h-6 w-6" />
        Inkwell
      </span>
      <div className="flex gap-4">
        <NavLink to="/" className={linkClass}>Feed</NavLink>
        <NavLink to="/write" className={linkClass}>Write</NavLink>
        <NavLink to="/login" className={linkClass}>Log In</NavLink>
      </div>
    </nav>
  );
}
