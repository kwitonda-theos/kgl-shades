"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface AdminUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const navItems = [
  {
    label: "Analytics",
    href: "/admin",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
      </svg>
    ),
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    label: "Collections",
    href: "/admin/collections",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const userData = localStorage.getItem("kgl-user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        if (parsed.role === "admin") {
          setUser(parsed);
          setChecking(false);
        } else {
          window.location.href = "/";
        }
      } catch {
        // invalid JSON
        window.location.href = "/";
      }
    } else {
      window.location.href = "/";
    }

    // Check theme
    const savedTheme = localStorage.getItem("kgl-theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("kgl-token");
    localStorage.removeItem("kgl-user");
    window.location.href = "/";
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("kgl-theme", next);
    if (next === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  if (checking) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner" />
        <p>Verifying access...</p>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "admin-sidebar--open" : ""}`}>
        <div className="admin-sidebar-header">
          <a href="/" className="admin-logo">
            <span className="admin-logo-kgl">KGL</span>
            <span className="admin-logo-shades">SHADES</span>
          </a>
          <span className="admin-logo-badge">ADMIN</span>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${isActive ? "admin-nav-item--active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <a href="/" className="admin-nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            <span>Back to Store</span>
          </a>
        </div>
      </aside>

      {/* Main content area */}
      <div className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <button
            className="admin-hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="admin-topbar-right">
            <button
              className="admin-theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "8px", borderRadius: "var(--radius-sm)" }}
            >
              {theme === "dark" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <span className="admin-topbar-greeting">
              {user?.firstName} {user?.lastName}
            </span>
            <button className="admin-topbar-logout" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
