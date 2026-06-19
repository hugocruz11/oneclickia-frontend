"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

// Cáscara del dashboard: sidebar fijo en desktop (>=md) y drawer deslizable
// en móvil. Vive en cliente porque maneja el estado abierto/cerrado del
// drawer. El cierre se dispara desde los enlaces (onNavigate), el overlay y
// la tecla Escape — no hace falta un efecto por ruta.
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Bloquea el scroll del fondo mientras el drawer está abierto.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Permite cerrar con Escape (accesibilidad de teclado).
  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar fijo — solo desktop */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Drawer móvil + overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-ink/50"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navegación"
            className="absolute inset-y-0 left-0 w-60 shadow-xl"
          >
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
