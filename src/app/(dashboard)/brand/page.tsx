"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import type { Brand } from "@/lib/types";

export default function BrandPage() {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<{ brand: Brand }>("/brand")
      .then((res) => setBrand(res.brand))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <p className="text-error">{error}</p>
      </Card>
    );
  }

  if (!brand) return null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink">Mi Marca</h1>
      <p className="mt-1 text-sm text-muted">
        Información extraída de tu sitio web y logo.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <Card>
          <div className="flex items-start gap-4">
            {brand.logoUrl && (
              <img
                src={`http://localhost:3000${brand.logoUrl}`}
                alt="Logo"
                className="h-16 w-16 rounded-md border border-sand object-contain"
              />
            )}
            <div>
              <h2 className="text-lg font-semibold text-ink">
                {brand.name || "Sin nombre"}
              </h2>
              {brand.websiteUrl && (
                <p className="text-sm text-muted">{brand.websiteUrl}</p>
              )}
              {brand.instagramUrl && (
                <p className="text-sm text-muted">{brand.instagramUrl}</p>
              )}
            </div>
          </div>
        </Card>

        {brand.webSummary && (
          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Resumen del sitio web
            </h3>
            <p className="mt-2 text-sm text-charcoal">{brand.webSummary}</p>
          </Card>
        )}

        {brand.logoAnalysis && (
          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Análisis del logo
            </h3>
            <p className="mt-2 text-sm text-charcoal">{brand.logoAnalysis}</p>
          </Card>
        )}

        {brand.instagramSummary && (
          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Resumen de Instagram
            </h3>
            <p className="mt-2 text-sm text-charcoal">
              {brand.instagramSummary}
            </p>
          </Card>
        )}

        {brand.primaryColors && brand.primaryColors.length > 0 && (
          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Colores de la marca
            </h3>
            <div className="mt-2 flex gap-2">
              {brand.primaryColors.map((color, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded-md border border-sand"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-muted">{color}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Fuentes de datos
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(brand.sources || {}).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center rounded-sm border border-sand bg-sand-light px-2 py-0.5 text-xs text-charcoal"
              >
                {key}: {value}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
