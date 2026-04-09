"use client";

import { useAuth } from "@/contexts/AuthContext";

export function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 items-center justify-end gap-4 border-b border-sand bg-cream px-6">
      {user && (
        <span className="text-sm text-muted">{user.email}</span>
      )}
      <button
        className="text-sm text-muted hover:text-ink transition-colors"
        onClick={logout}
      >
        Cerrar sesión
      </button>
    </header>
  );
}
