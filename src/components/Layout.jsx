import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FileText, Target, PuzzleIcon, Map, History,
  MessageCircle, Settings as SettingsIcon, Compass,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resume", label: "Resume", icon: FileText },
  { to: "/job-matcher", label: "Job Matcher", icon: Target },
  { to: "/skill-gap", label: "Skill Gap", icon: PuzzleIcon },
  { to: "/roadmap", label: "Learning Roadmap", icon: Map },
  { to: "/history", label: "Analysis History", icon: History },
  { to: "/assistant", label: "AI Assistant", icon: MessageCircle },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Layout({ children }) {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  if (isLanding) return children;

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="w-64 shrink-0 border-r border-line bg-white flex flex-col">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-line">
          <Compass size={20} className="text-brand" />
          <span className="font-display text-lg font-semibold text-ink">Resolve</span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-light text-brand-dark"
                    : "text-muted hover:bg-paper hover:text-ink"
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-line text-xs text-muted">
          AI analysis is an estimate — always review suggestions yourself.
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
