"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Spinner } from "@/components/ui/Spinner";
import { api, ApiError } from "@/lib/api";
import type { Brand } from "@/lib/types";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function BrandPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      }
    >
      <BrandPageContent />
    </Suspense>
  );
}

function BrandPageContent() {
  const searchParams = useSearchParams();
  const fromOnboarding = searchParams.get("from") === "onboarding";

  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Editable fields
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [webSummary, setWebSummary] = useState("");
  const [instagramSummary, setInstagramSummary] = useState("");
  const [logoAnalysis, setLogoAnalysis] = useState("");
  const [primaryColors, setPrimaryColors] = useState<string[]>([]);

  useEffect(() => {
    api
      .get<{ brand: Brand }>("/brand")
      .then((res) => {
        setBrand(res.brand);
        populateForm(res.brand);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function populateForm(b: Brand) {
    setName(b.name || "");
    setWebsiteUrl(b.websiteUrl || "");
    setInstagramUrl(b.instagramUrl || "");
    setWebSummary(b.webSummary || "");
    setInstagramSummary(b.instagramSummary || "");
    setLogoAnalysis(b.logoAnalysis || "");
    setPrimaryColors(b.primaryColors || []);
  }

  function handleCancel() {
    if (brand) populateForm(brand);
    setEditing(false);
    setError("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const updated = await api.patch<{ brand: Brand }>("/brand", {
        name: name.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        instagramUrl: instagramUrl.trim() || undefined,
        webSummary: webSummary.trim() || undefined,
        instagramSummary: instagramSummary.trim() || undefined,
        logoAnalysis: logoAnalysis.trim() || undefined,
        primaryColors: primaryColors.filter((c) => /^#[0-9a-fA-F]{6}$/.test(c)),
      });
      setBrand(updated.brand);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Error al guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!brand) {
    return (
      <Card>
        <p className="text-error">{error || "No se encontró la marca."}</p>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Mi Marca</h1>
          <p className="mt-1 text-sm text-muted">
            Información extraída de tu sitio web y logo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-sm text-success">Guardado</span>
          )}
          {editing ? (
            <>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} loading={saving}>
                Guardar
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              Editar
            </Button>
          )}
        </div>
      </div>

      {fromOnboarding && (
        <div className="mt-4 rounded-md border border-orange/20 bg-orange/10 p-4">
          <p className="text-sm font-medium text-ink">
            Revisa la información de tu marca
          </p>
          <p className="mt-1 text-sm text-muted">
            Extrajimos estos datos de tu sitio web y logo. Si algo no es correcto,
            puedes editarlo antes de empezar a crear campañas.
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              Editar información
            </Button>
            <Link href="/ads/search">
              <Button size="sm">
                Todo bien, continuar
              </Button>
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {/* Header card */}
        <Card>
          <div className="flex items-start gap-4">
            {brand.logoUrl && (
              <img
                src={`${API_HOST}${brand.logoUrl}`}
                alt="Logo"
                className="h-16 w-16 rounded-md border border-sand object-contain"
              />
            )}
            <div className="flex-1">
              {editing ? (
                <div className="flex flex-col gap-3">
                  <Input
                    label="Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Input
                    label="Sitio web"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                  <Input
                    label="Instagram"
                    type="url"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-ink">
                    {brand.name || "Sin nombre"}
                  </h2>
                  {brand.websiteUrl && (
                    <p className="text-sm text-muted">{brand.websiteUrl}</p>
                  )}
                  {brand.instagramUrl && (
                    <p className="text-sm text-muted">{brand.instagramUrl}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Web Summary */}
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Resumen del sitio web
          </h3>
          {editing ? (
            <Textarea
              className="mt-2"
              rows={6}
              value={webSummary}
              onChange={(e) => setWebSummary(e.target.value)}
            />
          ) : (
            <p className="mt-2 text-sm text-charcoal">
              {brand.webSummary || "Sin resumen."}
            </p>
          )}
        </Card>

        {/* Logo Analysis */}
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Análisis del logo
          </h3>
          {editing ? (
            <Textarea
              className="mt-2"
              rows={5}
              value={logoAnalysis}
              onChange={(e) => setLogoAnalysis(e.target.value)}
            />
          ) : (
            <p className="mt-2 text-sm text-charcoal">
              {brand.logoAnalysis || "Sin análisis."}
            </p>
          )}
        </Card>

        {/* Instagram Summary */}
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Resumen de Instagram
          </h3>
          {editing ? (
            <Textarea
              className="mt-2"
              rows={4}
              value={instagramSummary}
              onChange={(e) => setInstagramSummary(e.target.value)}
            />
          ) : (
            <p className="mt-2 text-sm text-charcoal">
              {brand.instagramSummary || "Sin resumen."}
            </p>
          )}
        </Card>

        {/* Colors */}
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Colores de la marca
          </h3>
          {editing ? (
            <div className="mt-3 flex flex-col gap-3">
              {primaryColors.map((color, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      const updated = [...primaryColors];
                      updated[i] = e.target.value;
                      setPrimaryColors(updated);
                    }}
                    className="h-9 w-9 cursor-pointer rounded-md border border-sand bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => {
                      const updated = [...primaryColors];
                      updated[i] = e.target.value;
                      setPrimaryColors(updated);
                    }}
                    placeholder="#000000"
                    maxLength={7}
                    className="w-24 rounded-md border border-sand bg-cream px-2 py-1.5 font-mono text-sm text-ink placeholder:text-muted focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPrimaryColors(primaryColors.filter((_, j) => j !== i))
                    }
                    className="text-sm text-muted hover:text-error"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setPrimaryColors([...primaryColors, "#000000"])}
                className="self-start text-sm text-orange hover:text-orange-hover"
              >
                + Agregar color
              </button>
            </div>
          ) : (
            <div className="mt-2 flex gap-2">
              {(brand.primaryColors || []).length > 0 ? (
                brand.primaryColors.map((color, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="h-8 w-8 rounded-md border border-sand"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-muted">{color}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted">Sin colores definidos.</p>
              )}
            </div>
          )}
        </Card>

        {/* Sources */}
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
