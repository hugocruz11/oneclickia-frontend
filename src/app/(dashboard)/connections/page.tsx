"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import { BrandIcon, type BrandName } from "@/components/ui/BrandIcon";
import { ShopifyConnectionPanel } from "@/components/connections/ShopifyConnectionPanel";
import { MetaConnectionPanel } from "@/components/connections/MetaConnectionPanel";

type Tab = "shopify" | "meta";

const TABS: { key: Tab; label: string; brand: BrandName }[] = [
  { key: "shopify", label: "Shopify", brand: "shopify" },
  { key: "meta", label: "Meta", brand: "meta" },
];

function ConnectionsInner() {
  const params = useSearchParams();
  // ?tab=meta abre directamente esa pestaña (los callbacks OAuth la usan).
  const initial: Tab = params.get("tab") === "meta" ? "meta" : "shopify";
  const [tab, setTab] = useState<Tab>(initial);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink">Conexiones</h1>
      <p className="mt-1 text-sm text-muted">
        Gestiona tus integraciones con Shopify y Meta.
      </p>

      {/* Tabs por proveedor */}
      <div
        role="tablist"
        aria-label="Proveedores de conexión"
        className="mt-6 flex gap-1 border-b border-sand"
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-orange text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <BrandIcon name={t.brand} size={18} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {tab === "shopify" ? (
          <ShopifyConnectionPanel />
        ) : (
          <MetaConnectionPanel />
        )}
      </div>
    </div>
  );
}

export default function ConnectionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      }
    >
      <ConnectionsInner />
    </Suspense>
  );
}
