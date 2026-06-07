import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar({ username, onLogout }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/vehicles",    label: "Vehicles" },
    { to: "/trips",       label: "Trips" },
    { to: "/maintenance", label: "Maintenance" },
    { to: "/reports",     label: "Reports" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-blue-800 text-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-wide">SwiftWheel</span>
          <span className="text-blue-300 text-xs font-medium hidden sm:inline">Fleet Management System</span>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-5">
          {links.map((l) => (
            <Link key={l.to} to={l.to}
              className={`text-sm font-medium hover:text-blue-200 transition-colors ${
                isActive(l.to) ? "border-b-2 border-white pb-0.5" : ""
              }`}>
              {l.label}
            </Link>
          ))}
          <span className="text-blue-300 text-xs">|</span>
          <span className="text-sm text-blue-200">Hi, {username}</span>
          <button onClick={onLogout}
            className="bg-white text-blue-800 text-sm px-3 py-1 rounded hover:bg-blue-100 font-medium">
            Logout
          </button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-blue-900 px-4 pb-4 flex flex-col gap-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className={`text-sm ${isActive(l.to) ? "font-bold underline" : "hover:underline"}`}>
              {l.label}
            </Link>
          ))}
          <span className="text-blue-300 text-xs">Logged in as {username}</span>
          <button onClick={onLogout}
            className="bg-white text-blue-800 text-sm px-3 py-1 rounded w-max font-medium">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
