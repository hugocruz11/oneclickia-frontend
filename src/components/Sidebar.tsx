"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CREDITS_ENABLED } from "@/contexts/CreditsContext";
import { useAuth } from "@/contexts/AuthContext";

const allNavItems = [
  { href: "/ads/search", label: "Buscar Ads", icon: "🔍" },
  { href: "/ads/videos", label: "Buscar Videos", icon: "🎬" },
  { href: "/ads/videos/saved", label: "Videos guardados", icon: "💾" },
  { href: "/ads/favorites", label: "Favoritos", icon: "❤️" },
  { href: "/landings", label: "Landing pages", icon: "🧲" },
  { href: "/campaigns", label: "Campañas", icon: "📢" },
  { href: "/analytics", label: "Analytics", icon: "📊" },
  { href: "/brand", label: "Mi Marca", icon: "🏷️" },
  { href: "/products", label: "Mis Productos", icon: "📦" },
  { href: "/meta", label: "Meta Ads", icon: "📱" },
  { href: "/meta/audiences", label: "Públicos", icon: "🎯" },
  { href: "/shopify", label: "Tienda Shopify", icon: "🛍️" },
  { href: "/plans", label: "Planes y créditos", icon: "💳" },
];

// Oculta "Planes y créditos" cuando el sistema de créditos está apagado.
const navItems = allNavItems.filter(
  (item) => CREDITS_ENABLED || item.href !== "/plans",
);

// Admin-only items. Rendered only when the logged-in user has role ADMIN.
// The backend also enforces this (403), so hiding the link is just UX.
const adminNavItems = [
  { href: "/admin/costs", label: "Costos IA", icon: "💸" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const items =
    user?.role === "ADMIN" ? [...navItems, ...adminNavItems] : navItems;

  return (
    <aside className="flex w-60 flex-col border-r border-sand bg-cream">
      <div className="flex h-14 items-center border-b border-sand px-4">
        <Link href="/" className="text-lg font-semibold text-ink">
          OneClickIA
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map((item) => {
          const hasNested = items.some(
            (other) =>
              other.href !== item.href && other.href.startsWith(item.href + "/"),
          );
          const isActive = hasNested
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sand-light text-ink"
                  : "text-charcoal hover:bg-sand-light hover:text-ink"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
