"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/ads/search", label: "Buscar Ads", icon: "🔍" },
  { href: "/campaigns", label: "Campañas", icon: "📢" },
  { href: "/brand", label: "Mi Marca", icon: "🏷️" },
  { href: "/meta", label: "Meta Ads", icon: "📱" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 flex-col border-r border-sand bg-cream">
      <div className="flex h-14 items-center border-b border-sand px-4">
        <Link href="/" className="text-lg font-semibold text-ink">
          Movity
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
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
