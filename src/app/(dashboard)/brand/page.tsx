"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { FileUpload } from "@/components/ui/FileUpload";
import { api, ApiError } from "@/lib/api";
import type { Brand, PricePositioning } from "@/lib/types";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const PRICE_POSITIONING_LABELS: Record<PricePositioning, string> = {
  VALUE: "Value (económico)",
  MID_MARKET: "Mid-market (medio)",
  PREMIUM_ACCESSIBLE: "Premium accesible",
  PREMIUM: "Premium",
  ULTRA_PREMIUM: "Ultra premium",
};

const PRICE_POSITIONING_OPTIONS: { value: PricePositioning | ""; label: string }[] = [
  { value: "", label: "Sin definir" },
  ...(Object.keys(PRICE_POSITIONING_LABELS) as PricePositioning[]).map((v) => ({
    value: v,
    label: PRICE_POSITIONING_LABELS[v],
  })),
];

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

  // Logo: se sube por separado (multipart) al guardar.
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Editable fields (basics)
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [webSummary, setWebSummary] = useState("");
  const [instagramSummary, setInstagramSummary] = useState("");
  const [logoAnalysis, setLogoAnalysis] = useState("");
  const [primaryColors, setPrimaryColors] = useState<string[]>([]);

  // Editable fields (LA MARCA 12 questions)
  const [identityContext, setIdentityContext] = useState("");
  const [markets, setMarkets] = useState("");
  const [mission, setMission] = useState("");
  const [brandPersona, setBrandPersona] = useState("");
  const [toneOfVoice, setToneOfVoice] = useState("");
  const [communicationProhibitions, setCommunicationProhibitions] = useState("");
  const [admiredBrands, setAdmiredBrands] = useState("");
  const [coreBelief, setCoreBelief] = useState("");
  const [visualIdentity, setVisualIdentity] = useState("");
  const [pricePositioning, setPricePositioning] = useState<PricePositioning | "">("");
  const [positioningStatement, setPositioningStatement] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [competitiveEdge, setCompetitiveEdge] = useState("");
  const [marketGap, setMarketGap] = useState("");

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
    setIdentityContext(b.identityContext || "");
    setMarkets(b.markets || "");
    setMission(b.mission || "");
    setBrandPersona(b.brandPersona || "");
    setToneOfVoice(b.toneOfVoice || "");
    setCommunicationProhibitions(b.communicationProhibitions || "");
    setAdmiredBrands(b.admiredBrands || "");
    setCoreBelief(b.coreBelief || "");
    setVisualIdentity(b.visualIdentity || "");
    setPricePositioning(b.pricePositioning ?? "");
    setPositioningStatement(b.positioningStatement || "");
    setCompetitors(b.competitors || "");
    setCompetitiveEdge(b.competitiveEdge || "");
    setMarketGap(b.marketGap || "");
  }

  function handleCancel() {
    if (brand) populateForm(brand);
    setLogoFile(null);
    setEditing(false);
    setError("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      // Si se eligió un logo nuevo, se sube primero (endpoint multipart aparte).
      if (logoFile) {
        const form = new FormData();
        form.append("logo", logoFile);
        await api.post<{ brand: Brand }>("/brand/logo", form);
      }
      const updated = await api.patch<{ brand: Brand }>("/brand", {
        name: name.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        instagramUrl: instagramUrl.trim() || undefined,
        webSummary: webSummary.trim() || undefined,
        instagramSummary: instagramSummary.trim() || undefined,
        logoAnalysis: logoAnalysis.trim() || undefined,
        primaryColors: primaryColors.filter((c) => /^#[0-9a-fA-F]{6}$/.test(c)),
        identityContext: identityContext.trim() || undefined,
        markets: markets.trim() || undefined,
        mission: mission.trim() || undefined,
        brandPersona: brandPersona.trim() || undefined,
        toneOfVoice: toneOfVoice.trim() || undefined,
        communicationProhibitions: communicationProhibitions.trim() || undefined,
        admiredBrands: admiredBrands.trim() || undefined,
        coreBelief: coreBelief.trim() || undefined,
        visualIdentity: visualIdentity.trim() || undefined,
        pricePositioning: pricePositioning || undefined,
        positioningStatement: positioningStatement.trim() || undefined,
        competitors: competitors.trim() || undefined,
        competitiveEdge: competitiveEdge.trim() || undefined,
        marketGap: marketGap.trim() || undefined,
      });
      setBrand(updated.brand);
      setLogoFile(null);
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
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Mi Marca</h1>
          <p className="mt-1 text-sm text-muted">
            Información completa de tu marca: identidad básica, las 12 preguntas del diagnóstico
            y los análisis automáticos del sitio web y logo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-sm text-success">Guardado</span>}
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
            Esto es lo que captamos del onboarding. Si algo no está bien, puedes editarlo
            antes de empezar a crear campañas.
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              Editar información
            </Button>
            <Link href="/ads/search">
              <Button size="sm">Todo bien, continuar</Button>
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
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${API_HOST}${brand.logoUrl}`}
                alt="Logo"
                className="h-16 w-16 rounded-md border border-sand object-contain"
              />
            )}
            <div className="flex-1">
              {editing ? (
                <div className="flex flex-col gap-3">
                  <FileUpload
                    label="Logo"
                    value={logoFile}
                    onChange={setLogoFile}
                    helperText={
                      brand.logoUrl && !logoFile
                        ? "Ya tienes un logo. Sube uno nuevo para reemplazarlo."
                        : "PNG, JPG o WEBP (max 5MB)."
                    }
                  />
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

        {/* ── BLOQUE 1: Identidad básica (Q1-3) ── */}
        <SectionHeader title="Identidad de la marca" />

        <FieldCard
          title="1. Nombre, año, país y canal de venta"
          value={brand.identityContext}
          editing={editing}
          rows={4}
          inputValue={identityContext}
          onChange={setIdentityContext}
        />
        <FieldCard
          title="2. Mercados actuales y mercados meta"
          value={brand.markets}
          editing={editing}
          rows={4}
          inputValue={markets}
          onChange={setMarkets}
        />
        <FieldCard
          title="3. Misión: por qué existe tu marca"
          value={brand.mission}
          editing={editing}
          rows={4}
          inputValue={mission}
          onChange={setMission}
        />

        {/* ── BLOQUE 2: Personalidad y tono (Q4-7) ── */}
        <SectionHeader title="Personalidad y tono" />

        <FieldCard
          title="4. Persona de marca"
          value={brand.brandPersona}
          editing={editing}
          rows={5}
          inputValue={brandPersona}
          onChange={setBrandPersona}
        />
        <FieldCard
          title="5. Tono de voz"
          value={brand.toneOfVoice}
          editing={editing}
          rows={5}
          inputValue={toneOfVoice}
          onChange={setToneOfVoice}
        />
        <FieldCard
          title="6. Prohibiciones de comunicación"
          value={brand.communicationProhibitions}
          editing={editing}
          rows={5}
          inputValue={communicationProhibitions}
          onChange={setCommunicationProhibitions}
        />
        <FieldCard
          title="7. Marcas que admira y qué replicaría"
          value={brand.admiredBrands}
          editing={editing}
          rows={4}
          inputValue={admiredBrands}
          onChange={setAdmiredBrands}
        />

        {/* ── BLOQUE 3: Filosofía (Q8) ── */}
        <SectionHeader title="Filosofía" />

        <FieldCard
          title="8. Creencia central / anti-narrativa"
          value={brand.coreBelief}
          editing={editing}
          rows={5}
          inputValue={coreBelief}
          onChange={setCoreBelief}
        />

        {/* ── BLOQUE 4: Identidad visual (Q9) ── */}
        <SectionHeader title="Identidad visual" />

        <FieldCard
          title="9. Colores, tipografías, estética, referencias"
          value={brand.visualIdentity}
          editing={editing}
          rows={6}
          inputValue={visualIdentity}
          onChange={setVisualIdentity}
        />

        {/* ── BLOQUE 5: Posicionamiento competitivo (Q10-12) ── */}
        <SectionHeader title="Posicionamiento competitivo" />

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            10. Rango de precio y percepción
          </h3>
          {editing ? (
            <div className="mt-2 flex flex-col gap-3">
              <Select
                label="Tier"
                value={pricePositioning}
                onChange={(e) =>
                  setPricePositioning(e.target.value as PricePositioning | "")
                }
                options={PRICE_POSITIONING_OPTIONS}
              />
              <Textarea
                rows={4}
                placeholder="Qué comunica ese posicionamiento..."
                value={positioningStatement}
                onChange={(e) => setPositioningStatement(e.target.value)}
              />
            </div>
          ) : (
            <div className="mt-2 flex flex-col gap-2">
              {brand.pricePositioning ? (
                <span className="inline-flex w-fit items-center rounded-sm border border-orange/20 bg-orange/10 px-2 py-0.5 text-xs font-semibold text-orange">
                  {PRICE_POSITIONING_LABELS[brand.pricePositioning]}
                </span>
              ) : (
                <p className="text-sm text-muted">Sin definir el tier.</p>
              )}
              <p className="text-sm text-charcoal">
                {brand.positioningStatement || "Sin descripción del posicionamiento."}
              </p>
            </div>
          )}
        </Card>

        <FieldCard
          title="11. Competidores directos y diferenciación"
          value={brand.competitors}
          editing={editing}
          rows={6}
          inputValue={competitors}
          onChange={setCompetitors}
        />
        <FieldCard
          title="12a. En qué es mejor tu marca"
          value={brand.competitiveEdge}
          editing={editing}
          rows={4}
          inputValue={competitiveEdge}
          onChange={setCompetitiveEdge}
        />
        <FieldCard
          title="12b. Hueco de mercado que ocupa"
          value={brand.marketGap}
          editing={editing}
          rows={4}
          inputValue={marketGap}
          onChange={setMarketGap}
        />

        {/* ── Análisis automáticos + visuales ── */}
        <SectionHeader title="Análisis automáticos (extraídos con IA)" />

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
            <p className="mt-2 whitespace-pre-line text-sm text-charcoal">
              {brand.webSummary || "Sin resumen."}
            </p>
          )}
        </Card>

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
            <p className="mt-2 whitespace-pre-line text-sm text-charcoal">
              {brand.logoAnalysis || "Sin análisis."}
            </p>
          )}
        </Card>

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
            <p className="mt-2 whitespace-pre-line text-sm text-charcoal">
              {brand.instagramSummary || "Sin resumen."}
            </p>
          )}
        </Card>

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
            <div className="mt-2 flex flex-wrap gap-2">
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

        {/* Sources (debug-ish footer) */}
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Fuentes de datos
          </h3>
          <p className="mt-1 text-xs text-muted">
            Indica si cada campo provino del onboarding (form), del análisis automático
            de la web (web) o del logo (manual).
          </p>
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

// ─── Helpers ──────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }): ReactNode {
  return (
    <h2 className="mt-4 text-xs font-semibold uppercase tracking-wider text-orange">
      {title}
    </h2>
  );
}

function FieldCard({
  title,
  value,
  editing,
  rows,
  inputValue,
  onChange,
}: {
  title: string;
  value: string | null;
  editing: boolean;
  rows: number;
  inputValue: string;
  onChange: (v: string) => void;
}) {
  return (
    <Card>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
        {title}
      </h3>
      {editing ? (
        <Textarea
          className="mt-2"
          rows={rows}
          value={inputValue}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <p className="mt-2 whitespace-pre-line text-sm text-charcoal">
          {value || "Sin responder."}
        </p>
      )}
    </Card>
  );
}
