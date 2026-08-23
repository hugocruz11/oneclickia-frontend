"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCredits } from "@/contexts/CreditsContext";
import { useI18n } from "@/contexts/I18nContext";
import { Icon } from "@/components/ui/Icon";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

// onMenuClick: abre el drawer de navegación en móvil. La hamburguesa solo
// se muestra por debajo de `md` (en desktop el sidebar es fijo).
export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { summary } = useCredits();
  const { t, localeTag } = useI18n();

  return (
    <header className="flex h-14 items-center gap-2 border-b border-sand bg-cream px-4 sm:gap-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label={t("Abrir menú de navegación")}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-sand text-charcoal transition-colors hover:bg-sand-light md:hidden"
      >
        <Icon name="menu" size={20} />
      </button>

      {/* Logo visible solo en móvil (en desktop ya está en el sidebar). */}
      <Link href="/" aria-label={t("OneClickIA — inicio")} className="md:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-oki-trim.png" alt="OneClickIA" className="h-8 w-auto" />
      </Link>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        {summary && (
          <Link
            href="/plans"
            className="flex items-center gap-1.5 rounded-pill border border-sand bg-sand-light px-3 py-1 text-sm font-semibold text-ink transition-colors hover:bg-sand"
            title={t("Plan {plan} — {count} créditos", {
              plan: summary.planName,
              count: summary.balance.total,
            })}
          >
            <Icon name="credit-card" size={16} className="text-cyan-600" />
            <span>{summary.balance.total.toLocaleString(localeTag)}</span>
            <span className="hidden text-muted sm:inline">{t("créditos")}</span>
          </Link>
        )}
        <LocaleSwitcher compact />
        <button
          onClick={toggle}
          aria-label={
            theme === "light"
              ? t("Activar modo oscuro")
              : t("Activar modo claro")
          }
          className="flex h-9 w-9 items-center justify-center rounded-md border border-sand transition-colors hover:bg-sand-light"
          title={theme === "light" ? t("Modo oscuro") : t("Modo claro")}
        >
          <Icon
            name={theme === "light" ? "moon" : "sun"}
            size={18}
            className={theme === "light" ? "text-indigo-400" : "text-amber-500"}
          />
        </button>
        {user && (
          <span className="hidden max-w-[180px] truncate text-sm text-muted lg:inline">
            {user.email}
          </span>
        )}
        <button
          type="button"
          aria-label={t("Cerrar sesión")}
          className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
          onClick={logout}
        >
          <Icon name="logout" size={18} />
          <span className="hidden sm:inline">{t("Cerrar sesión")}</span>
        </button>
      </div>
    </header>
  );
}
