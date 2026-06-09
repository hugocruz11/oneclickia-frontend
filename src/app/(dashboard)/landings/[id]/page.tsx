"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useCredits } from "@/contexts/CreditsContext";
import { api, ApiError } from "@/lib/api";
import {
  landingsApi,
  type Landing,
  type LandingContent,
  type LandingTheme,
} from "@/lib/landings";

const DEFAULT_THEME: LandingTheme = {
  primaryColor: "#111827",
  backgroundColor: "#ffffff",
  textColor: "#111827",
  logoUrl: null,
};

interface ShopifyProduct { id: string; title: string; handle: string }

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const input =
  "w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-orange focus:outline-none";
const label = "text-xs font-medium text-charcoal";

// ── line-based <-> structured helpers for list sections ──
const linesToArr = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
const pairsToArr = (s: string) =>
  linesToArr(s).map((l) => {
    const [a, ...rest] = l.split("::");
    return { a: (a ?? "").trim(), b: rest.join("::").trim() };
  });

export default function LandingEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { refresh } = useCredits();

  const [landing, setLanding] = useState<Landing | null>(null);
  const [content, setContent] = useState<LandingContent | null>(null);
  const [html, setHtml] = useState<string>("");
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [appProducts, setAppProducts] = useState<
    { id: string; name: string | null }[]
  >([]);
  const [shop, setShop] = useState<string | null>(null);

  const [avatar, setAvatar] = useState("");
  const [instructions, setInstructions] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    const l = await landingsApi.get(id);
    setLanding(l);
    setContent(l.content);
    setHtml(l.html ?? "");
    setAvatar(l.avatar ?? "");
  }, [id]);

  useEffect(() => {
    load()
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Error al cargar."),
      )
      .finally(() => setLoading(false));
    api
      .get<ShopifyProduct[]>("/connections/shopify/products")
      .then(setProducts)
      .catch(() => setProducts([]));
    api
      .get<{ products: { id: string; name: string | null }[] }>("/products")
      .then((r) => setAppProducts(r.products))
      .catch(() => setAppProducts([]));
    api
      .get<{ connected: boolean; shop?: string }>("/connections/shopify/status")
      .then((s) => setShop(s.connected ? s.shop ?? null : null))
      .catch(() => setShop(null));
  }, [load]);

  function patch<K extends keyof Landing>(key: K, value: Landing[K]) {
    setLanding((prev) => (prev ? { ...prev, [key]: value } : prev));
  }
  function setSection<K extends keyof LandingContent>(key: K, value: LandingContent[K]) {
    setContent((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!landing || !content) return;
    setSaving(true);
    setError("");
    try {
      const updated = await landingsApi.update(id, {
        title: landing.title ?? undefined,
        avatar: landing.avatar ?? undefined,
        productHandle: landing.productHandle ?? undefined,
        appProductId: landing.appProductId ?? undefined,
        pixelId: landing.pixelId,
        seoTitle: landing.seoTitle,
        seoDescription: landing.seoDescription,
        content,
        ...(html ? { html } : {}),
      });
      setLanding(updated);
      setSavedAt(new Date().toLocaleTimeString("es"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    try {
      const updated = await landingsApi.generate(id, {
        avatar: avatar.trim() || undefined,
        instructions: instructions.trim() || undefined,
      });
      setLanding(updated);
      setContent(updated.content);
      setHtml(updated.html ?? "");
      void refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo generar.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        "¿Eliminar esta landing? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }
    setError("");
    try {
      await landingsApi.remove(id);
      router.push("/landings");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar.");
    }
  }

  async function togglePublish() {
    if (!landing) return;
    const next = landing.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setError("");
    try {
      const updated = await landingsApi.update(id, { status: next });
      patch("status", updated.status);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cambiar el estado.");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!landing || !content) {
    return <p className="text-sm text-error">{error || "No encontrada."}</p>;
  }

  const publicUrl = shop
    ? `https://${shop}/apps/ofertas/${landing.slug}`
    : null;

  // When the AI has designed the full page (html), we edit the HTML
  // directly and hide the legacy section/theme editors.
  const hasHtml = Boolean(landing.html || html);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/landings" className="text-sm text-muted hover:text-ink">
            ← Landings
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-ink">
            {landing.title || landing.slug}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={landing.status === "PUBLISHED" ? "success" : "muted"}>
            {landing.status === "PUBLISHED" ? "Publicada" : "Borrador"}
          </Badge>
          <a
            href={`${API_BASE}/landing-preview/${id}`}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="ghost" size="sm">
              Vista previa
            </Button>
          </a>
          <Button variant="ghost" size="sm" onClick={togglePublish}>
            {landing.status === "PUBLISHED" ? "Despublicar" : "Publicar"}
          </Button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-error hover:bg-error/10"
          >
            Eliminar
          </button>
          <Button onClick={handleSave} loading={saving} size="sm">
            Guardar
          </Button>
        </div>
      </div>

      {savedAt && (
        <p className="mt-2 text-xs text-success-text">Guardado a las {savedAt}.</p>
      )}
      {error && (
        <div className="mt-3 rounded-md border border-error/20 bg-error/10 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {publicUrl && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>URL para tu anuncio:</span>
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="text-orange hover:underline"
          >
            {publicUrl}
          </a>
          <button
            type="button"
            className="rounded border border-sand px-2 py-0.5 text-charcoal hover:bg-sand-light"
            onClick={() => navigator.clipboard?.writeText(publicUrl)}
          >
            Copiar
          </button>
          {landing.status !== "PUBLISHED" && (
            <span>(publícala para que sea visible)</span>
          )}
        </div>
      )}

      {/* ── Stats ── */}
      <div className="mt-4 flex gap-4">
        <Card className="flex-1 text-center">
          <p className="text-2xl font-bold text-ink">
            {landing.views.toLocaleString("es")}
          </p>
          <p className="text-xs text-muted">Vistas</p>
        </Card>
        <Card className="flex-1 text-center">
          <p className="text-2xl font-bold text-ink">
            {landing.clicks.toLocaleString("es")}
          </p>
          <p className="text-xs text-muted">Clics al CTA</p>
        </Card>
        <Card className="flex-1 text-center">
          <p className="text-2xl font-bold text-ink">
            {landing.views > 0
              ? `${((landing.clicks / landing.views) * 100).toFixed(1)}%`
              : "—"}
          </p>
          <p className="text-xs text-muted">CTR</p>
        </Card>
      </div>

      {/* ── AI generation ── */}
      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Generar con IA</h2>
        <p className="mt-1 text-xs text-muted">
          Describe el avatar/ángulo y la IA <strong>diseña toda la landing</strong>{" "}
          con la identidad de tu marca. (15 créditos)
        </p>
        <div className="mt-3 grid gap-3">
          <div>
            <label className={label}>Avatar / ángulo</label>
            <input
              className={input}
              placeholder="Ej: mujeres con problemas de digestión, cansadas de los polvos verdes"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Instrucciones extra (opcional)</label>
            <textarea
              className={input}
              rows={2}
              placeholder="Tono, ofertas, datos a destacar…"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>
          <div>
            <Button onClick={handleGenerate} loading={generating}>
              ✨ {hasHtml ? "Regenerar landing" : "Generar landing"}
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Metadata ── */}
      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-ink">Configuración</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className={label}>Nombre</label>
            <input
              className={input}
              value={landing.title ?? ""}
              onChange={(e) => patch("title", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Producto Shopify (checkout)</label>
            <select
              className={input}
              value={landing.productHandle ?? ""}
              onChange={(e) => patch("productHandle", e.target.value)}
            >
              <option value="">— Sin producto —</option>
              {products.map((p) => (
                <option key={p.id} value={p.handle}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Producto de la app (para el copy)</label>
            <select
              className={input}
              value={landing.appProductId ?? ""}
              onChange={(e) => patch("appProductId", e.target.value)}
            >
              <option value="">— Ninguno —</option>
              {appProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || "(sin nombre)"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Meta Pixel ID</label>
            <input
              className={input}
              value={landing.pixelId ?? ""}
              onChange={(e) => patch("pixelId", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Avatar (etiqueta)</label>
            <input
              className={input}
              value={landing.avatar ?? ""}
              onChange={(e) => patch("avatar", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>SEO título</label>
            <input
              className={input}
              value={landing.seoTitle ?? ""}
              onChange={(e) => patch("seoTitle", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>SEO descripción</label>
            <input
              className={input}
              value={landing.seoDescription ?? ""}
              onChange={(e) => patch("seoDescription", e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* ── AI-designed HTML (new approach) ── */}
      {hasHtml && (
        <Card className="mt-4">
          <h2 className="text-sm font-semibold text-ink">HTML de la landing</h2>
          <p className="mt-1 text-xs text-muted">
            La IA diseñó esta página completa con la identidad de tu marca. Puedes
            ajustar el HTML aquí (avanzado) o pulsar “Regenerar landing” arriba. El
            botón de compra, precio y pixel se inyectan solos — no los toques.
          </p>
          <textarea
            className={`${input} mt-3 font-mono text-xs`}
            rows={18}
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            spellCheck={false}
          />
          <p className="mt-2 text-xs text-muted">
            Usa “Vista previa” (arriba) para ver el resultado. Recuerda Guardar.
          </p>
        </Card>
      )}

      {/* ── Legacy structured editor (only when there's no AI HTML) ── */}
      {!hasHtml && (
        <>
      {/* ── Brand identity (theme) ── */}
      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-ink">Identidad de marca</h2>
        <p className="mt-1 text-xs text-muted">
          Colores y logo de la landing. Se toman de tu marca al crearla; ajústalos
          aquí. (La IA cambia los textos, no estos colores.)
        </p>
        {(() => {
          const theme = content.theme ?? DEFAULT_THEME;
          const setTheme = (patch: Partial<LandingTheme>) =>
            setSection("theme", { ...theme, ...patch });
          return (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-9 w-12 rounded border border-sand"
                  value={theme.primaryColor}
                  onChange={(e) => setTheme({ primaryColor: e.target.value })}
                />
                <span className="text-sm text-charcoal">Color principal (botón)</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-9 w-12 rounded border border-sand"
                  value={theme.backgroundColor}
                  onChange={(e) => setTheme({ backgroundColor: e.target.value })}
                />
                <span className="text-sm text-charcoal">Fondo</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-9 w-12 rounded border border-sand"
                  value={theme.textColor}
                  onChange={(e) => setTheme({ textColor: e.target.value })}
                />
                <span className="text-sm text-charcoal">Texto</span>
              </div>
              <div className="sm:col-span-2">
                <label className={label}>URL del logo (opcional)</label>
                <input
                  className={input}
                  placeholder="https://.../logo.png"
                  value={theme.logoUrl ?? ""}
                  onChange={(e) =>
                    setTheme({ logoUrl: e.target.value || null })
                  }
                />
              </div>
            </div>
          );
        })()}
      </Card>

      {/* ── Content sections ── */}
      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-ink">Contenido</h2>

        <div className="mt-3 grid gap-3">
          <div>
            <label className={label}>Hero — titular</label>
            <input
              className={input}
              value={content.hero.headline}
              onChange={(e) =>
                setSection("hero", { ...content.hero, headline: e.target.value })
              }
            />
          </div>
          <div>
            <label className={label}>Hero — subtítulo</label>
            <input
              className={input}
              value={content.hero.subheadline ?? ""}
              onChange={(e) =>
                setSection("hero", { ...content.hero, subheadline: e.target.value })
              }
            />
          </div>

          <div>
            <label className={label}>Dolor — título</label>
            <input
              className={input}
              value={content.pain.title}
              onChange={(e) =>
                setSection("pain", { ...content.pain, title: e.target.value })
              }
            />
            <label className={`${label} mt-2 block`}>
              Dolor — puntos (uno por línea)
            </label>
            <textarea
              className={input}
              rows={3}
              value={content.pain.bullets.join("\n")}
              onChange={(e) =>
                setSection("pain", {
                  ...content.pain,
                  bullets: linesToArr(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label className={label}>Beneficios — título</label>
            <input
              className={input}
              value={content.benefits.title}
              onChange={(e) =>
                setSection("benefits", { ...content.benefits, title: e.target.value })
              }
            />
            <label className={`${label} mt-2 block`}>
              Beneficios — “Título :: Descripción” (uno por línea)
            </label>
            <textarea
              className={input}
              rows={3}
              value={content.benefits.items
                .map((i) => `${i.title} :: ${i.description}`)
                .join("\n")}
              onChange={(e) =>
                setSection("benefits", {
                  ...content.benefits,
                  items: pairsToArr(e.target.value).map((p) => ({
                    title: p.a,
                    description: p.b,
                  })),
                })
              }
            />
          </div>

          <div>
            <label className={label}>Mecanismo — título</label>
            <input
              className={input}
              value={content.mechanism.title}
              onChange={(e) =>
                setSection("mechanism", { ...content.mechanism, title: e.target.value })
              }
            />
            <label className={`${label} mt-2 block`}>Mecanismo — texto</label>
            <textarea
              className={input}
              rows={3}
              value={content.mechanism.body}
              onChange={(e) =>
                setSection("mechanism", { ...content.mechanism, body: e.target.value })
              }
            />
          </div>

          <div>
            <label className={label}>Testimonios — “Nombre :: Frase” (uno por línea)</label>
            <textarea
              className={input}
              rows={3}
              value={content.testimonials
                .map((t) => `${t.name} :: ${t.quote}`)
                .join("\n")}
              onChange={(e) =>
                setSection(
                  "testimonials",
                  pairsToArr(e.target.value).map((p) => ({
                    name: p.a,
                    quote: p.b,
                    rating: 5,
                  })),
                )
              }
            />
          </div>

          <div>
            <label className={label}>Oferta — titular</label>
            <input
              className={input}
              value={content.offer.headline}
              onChange={(e) =>
                setSection("offer", { ...content.offer, headline: e.target.value })
              }
            />
            <label className={`${label} mt-2 block`}>Oferta — nota</label>
            <input
              className={input}
              value={content.offer.note ?? ""}
              onChange={(e) =>
                setSection("offer", { ...content.offer, note: e.target.value })
              }
            />
          </div>

          <div>
            <label className={label}>Botón (CTA)</label>
            <input
              className={input}
              value={content.cta.label}
              onChange={(e) => setSection("cta", { label: e.target.value })}
            />
          </div>

          <div>
            <label className={label}>FAQ — “Pregunta :: Respuesta” (una por línea)</label>
            <textarea
              className={input}
              rows={3}
              value={content.faq
                .map((f) => `${f.question} :: ${f.answer}`)
                .join("\n")}
              onChange={(e) =>
                setSection(
                  "faq",
                  pairsToArr(e.target.value).map((p) => ({
                    question: p.a,
                    answer: p.b,
                  })),
                )
              }
            />
          </div>
        </div>
      </Card>
        </>
      )}
    </div>
  );
}
