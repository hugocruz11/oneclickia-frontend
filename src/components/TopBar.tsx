"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCredits } from "@/contexts/CreditsContext";

export function TopBar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { summary } = useCredits();

  return (
    <header className="flex h-14 items-center justify-end gap-4 border-b border-sand bg-cream px-6">
      {summary && (
        <Link
          href="/plans"
          className="flex items-center gap-1.5 rounded-pill border border-sand bg-sand-light px-3 py-1 text-sm font-semibold text-ink transition-colors hover:bg-sand"
          title={`Plan ${summary.planName} — ${summary.balance.total} créditos`}
        >
          <span>💳</span>
          <span>{summary.balance.total.toLocaleString("es")}</span>
          <span className="text-muted">créditos</span>
        </Link>
      )}
      <button
        onClick={toggle}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-sand text-sm transition-colors hover:bg-sand-light"
        title={theme === "light" ? "Modo oscuro" : "Modo claro"}
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>
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
