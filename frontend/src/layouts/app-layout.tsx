import React, { useMemo } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfileSelector } from "@/components/profile-selector";
import { useAutoSelectProfile } from "@/hooks/use-auto-select-profile";

const routes = [
  { to: "/", label: "Dashboard" },
  { to: "/scrapers", label: "Scrapers" },
  { to: "/projects", label: "Proyectos" },
  { to: "/docs", label: "Documentación" },
];

export const AppLayout: React.FC = () => {
  // Forzar selección automática del perfil demo al cargar el layout
  useAutoSelectProfile();
  
  const navigation = useMemo(
    () =>
      routes.map((route) => (
        <NavLink
          key={route.to}
          to={route.to}
          className={({ isActive }) =>
            [
              "px-4 py-2 rounded-full transition-colors",
              isActive ? "bg-primary text-primary-foreground" : "text-slate-200 hover:bg-white/10",
            ].join(" ")
          }
        >
          {route.label}
        </NavLink>
      )),
    [],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold tracking-tight text-primary">Crawlbase Suite</span>
            <nav className="hidden gap-2 md:flex">{navigation}</nav>
          </div>
          <div className="flex items-center gap-3">
            <ProfileSelector />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
};

