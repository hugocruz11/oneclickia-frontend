"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CREDITS_ENABLED } from "@/contexts/CreditsContext";
import { useAuth } from "@/contexts/AuthContext";
import { Icon, type IconName } from "@/components/ui/Icon";

// `color` conserva el color que tenían los emojis originales (cada ítem con
// su tono distintivo). Son clases de texto Tailwind aplicadas al icono SVG.
type NavItem = { href: string; label: string; icon: IconName; color: string };
type NavGroup = { title: string; items: NavItem[] };

// Menú agrupado por etapa del flujo: descubrir → crear → analizar → negocio.
// Reduce la carga cognitiva de una lista plana de 13 ítems y refleja el
// recorrido real del usuario.
const navGroups: NavGroup[] = [
  {
    title: "Descubrir",
    items: [
      { href: "/ads/search", label: "Buscar Ads", icon: "search", color: "text-sky-500" },
      { href: "/ads/videos", label: "Buscar Videos", icon: "video", color: "text-rose-500" },
      { href: "/ads/favorites", label: "Favoritos", icon: "heart", color: "text-red-500" },
      { href: "/ads/videos/saved", label: "Videos guardados", icon: "bookmark", color: "text-indigo-500" },
    ],
  },
  {
    title: "Crear",
    items: [
      { href: "/campaigns", label: "Campañas", icon: "megaphone", color: "text-orange-500" },
      { href: "/landings", label: "Landing pages", icon: "magnet", color: "text-rose-600" },
    ],
  },
  {
    title: "Analizar",
    items: [
      { href: "/analytics", label: "Analytics", icon: "chart", color: "text-blue-500" },
      { href: "/meta/audiences", label: "Públicos", icon: "target", color: "text-red-600" },
    ],
  },
  {
    title: "Mi negocio",
    items: [
      { href: "/brand", label: "Mi Marca", icon: "tag", color: "text-amber-500" },
      { href: "/products", label: "Mis Productos", icon: "box", color: "text-amber-700" },
      { href: "/connections", label: "Conexiones", icon: "link", color: "text-violet-500" },
    ],
  },
];

// Grupo de cuenta — anclado al pie del sidebar (patrón estándar).
const accountItems: NavItem[] = [
  { href: "/plans", label: "Planes y créditos", icon: "credit-card", color: "text-cyan-600" },
];

// Admin-only items. Rendered only when the logged-in user has role ADMIN.
// The backend also enforces this (403), so hiding the link is just UX.
const adminItems: NavItem[] = [
  { href: "/admin/costs", label: "Costos IA", icon: "coins", color: "text-green-600" },
];

// Todos los hrefs (para detectar anidamiento al resolver el estado activo).
const allHrefs = [
  ...navGroups.flatMap((g) => g.items),
  ...accountItems,
  ...adminItems,
].map((i) => i.href);

// Estado activo: si un ítem tiene hijos en el menú (ej. /meta vs
// /meta/audiences) solo se marca con match exacto; si no, también con prefijo.
function computeIsActive(href: string, pathname: string): boolean {
  const hasNested = allHrefs.some(
    (other) => other !== href && other.startsWith(href + "/"),
  );
  return hasNested
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");
}

// onNavigate: lo dispara el drawer móvil al pulsar un enlace para cerrarse.
// En desktop no se pasa, así que el sidebar fijo no hace nada extra.
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Oculta "Planes y créditos" cuando el sistema de créditos está apagado.
  const account = accountItems.filter(
    (item) => CREDITS_ENABLED || item.href !== "/plans",
  );
  const bottomItems =
    user?.role === "ADMIN" ? [...account, ...adminItems] : account;

  function renderItem(item: NavItem) {
    const isActive = computeIsActive(item.href, pathname);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        aria-current={isActive ? "page" : undefined}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? "bg-sand-light text-ink"
            : "text-charcoal hover:bg-sand-light hover:text-ink"
        }`}
      >
        <Icon name={item.icon} size={18} className={item.color} />
        {item.label}
      </Link>
    );
  }

  return (
    <aside className="flex h-full w-60 flex-col border-r border-sand bg-cream">
      <div className="flex h-14 items-center border-b border-sand px-4">
        <Link href="/" onClick={onNavigate} aria-label="OneClickIA — inicio">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-oki-trim.png" alt="OneClickIA" className="h-10 w-auto" />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {navGroups.map((group, i) => (
          <div key={group.title} className={i === 0 ? "" : "mt-3"}>
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
              {group.title}
            </p>
            <div className="flex flex-col gap-1">
              {group.items.map(renderItem)}
            </div>
          </div>
        ))}

        {/* Cuenta — anclada al pie, separada por borde. */}
        {bottomItems.length > 0 && (
          <div className="mt-auto border-t border-sand pt-3">
            <div className="flex flex-col gap-1">
              {bottomItems.map(renderItem)}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}
