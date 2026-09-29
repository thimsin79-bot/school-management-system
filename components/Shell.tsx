"use client";

import { useState } from "react";
import { Icons } from "@/components/icons";
import { NAV } from "@/lib/nav";
import type { ViewKey } from "@/lib/nav";

export function Shell({
  active,
  onNavigate,
  children,
}: {
  active: ViewKey;
  onNavigate: (view: ViewKey) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  function navigate(view: ViewKey) {
    onNavigate(view);
    setOpen(false);
  }

  return (
    <div className="shell">
      <div className="header">
        <div className="header-brand">
          Student <span>Management</span>
        </div>
        <div className="header-bar">
          <button
            type="button"
            className="menu-toggle"
            aria-label="Toggle navigation"
            onClick={() => setOpen((prev) => !prev)}
          >
            ☰
          </button>
          <div className="header-user">
            <div className="avatar">🎓</div>
            Admin
          </div>
        </div>
      </div>

      <div className="body-row">
        <aside className={open ? "sidebar open" : "sidebar"}>
          <div className="sidebar-label">Dashboard</div>
          {NAV.map((entry) => {
            const Icon = Icons[entry.icon];
            return (
              <div
                key={entry.key}
                className={entry.key === active ? "nav-item active" : "nav-item"}
                onClick={() => navigate(entry.key)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") navigate(entry.key);
                }}
              >
                <span className="ic">
                  <Icon />
                </span>
                {entry.label}
              </div>
            );
          })}
        </aside>

        <main className="main">
          <div className="content">{children}</div>
        </main>
      </div>
    </div>
  );
}
