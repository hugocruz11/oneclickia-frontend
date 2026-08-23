"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Icon } from "@/components/ui/Icon";
import { useCredits } from "@/contexts/CreditsContext";
import { api, ApiError } from "@/lib/api";
import { landingsApi, type Landing } from "@/lib/landings";
import { useI18n } from "@/contexts/I18nContext";

interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
}

const inputClass =
  "w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-orange focus:outline-none";

export default function LandingsPage() {
  const router = useRouter();
  const { refresh, enabled: creditsEnabled } = useCredits();
  const { t, localeTag } = useI18n();
  const [landings, setLandings] = useState<Landing[]>([]);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [appProducts, setAppProducts] = useState<
    { id: string; name: string | null }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [avatar, setAvatar] = useState("");
  const [productHandle, setProductHandle] = useState("");
  const [appProductId, setAppProductId] = useState("");

  useEffect(() => {
    landingsApi
      .list()
      .then(setLandings)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Error al cargar."),
      )
      .finally(() => setLoading(false));
    // Products are best-effort (only if Shopify is connected).
    api
      .get<ShopifyProduct[]>("/connections/shopify/products")
      .then(setProducts)
      .catch(() => setProducts([]));
    // App products (rich survey data) → feed the AI generation.
    api
      .get<{ products: { id: string; name: string | null }[] }>("/products")
      .then((r) => setAppProducts(r.products))
      .catch(() => setAppProducts([]));
  }, []);

  async function handleDelete(id: string, name: string) {
    if (
      !window.confirm(
        t("¿Eliminar la landing “{name}”? No se puede deshacer.", { name }),
      )
    ) {
      return;
    }
    setError("");
    try {
      await landingsApi.remove(id);
      setLandings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar.");
    }
  }

  async function handleCreate() {
    if (!slug.trim()) {
      setError("Escribe un slug para la landing.");
      return;
    }
    setCreating(true);
    setError("");
    try {
      // 1) Create the landing row, then 2) generate it with AI right away
      // so the user lands on a finished design (not the placeholder).
      const landing = await landingsApi.create({
        slug: slug.trim(),
        title: title.trim() || undefined,
        avatar: avatar.trim() || undefined,
        productHandle: productHandle || undefined,
        appProductId: appProductId || undefined,
      });
      try {
        await landingsApi.generate(landing.id, {
          avatar: avatar.trim() || undefined,
        });
        void refresh();
      } catch {
        // If generation fails (e.g. no credits), the landing still exists;
        // the editor lets them regenerate. Continue to the editor.
      }
      router.push(`/landings/${landing.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear.");
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold text-ink">{t("Landing pages")}</h1>
      <p className="mt-1 text-sm text-muted">
        {t(
          "Crea una landing por avatar para tus campañas. Se publican bajo el dominio de tu tienda Shopify (App Proxy).",
        )}
      </p>

      {error && (
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 p-3">
          <p className="text-sm text-error">{t(error)}</p>
        </div>
      )}

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">{t("Nueva landing")}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <label className="text-xs font-medium text-charcoal">
              {t("Slug (URL)")}
            </label>
            <input
              className={inputClass}
              placeholder={t("salud-intestinal")}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-charcoal">
              {t("Nombre")}
            </label>
            <input
              className={inputClass}
              placeholder={t("Salud intestinal")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-charcoal">
              {t("Producto Shopify (checkout)")}
            </label>
            <select
              className={inputClass}
              value={productHandle}
              onChange={(e) => setProductHandle(e.target.value)}
            >
              <option value="">{t("— Sin producto —")}</option>
              {products.map((p) => (
                <option key={p.id} value={p.handle}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-charcoal">
              {t("Producto de la app (para el copy)")}
            </label>
            <select
              className={inputClass}
              value={appProductId}
              onChange={(e) => setAppProductId(e.target.value)}
            >
              <option value="">{t("— Ninguno —")}</option>
              {appProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || t("(sin nombre)")}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="text-xs font-medium text-charcoal">
            {t("Avatar / ángulo (a quién le vendes)")}
          </label>
          <textarea
            className={inputClass}
            rows={2}
            placeholder={t("Ej: mujeres con problemas de digestión, cansadas de los polvos verdes de mal sabor")}
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
        </div>
        <div className="mt-3">
          <Button onClick={handleCreate} loading={creating}>
            {creating ? (
              t("Creando y generando…")
            ) : (
              <>
                <Icon name="sparkles" size={16} className="mr-1.5" />
                {t("Crear y generar con IA")}
              </>
            )}
          </Button>
          <p className="mt-2 text-xs text-muted">
            {t("La IA diseña la landing completa con la identidad de tu marca")}
            {creditsEnabled ? t(" (15 créditos)") : ""}.
            {products.length === 0 &&
              t(" Conecta tu tienda en “Tienda Shopify” para elegir un producto.")}
          </p>
        </div>
      </Card>

      <div className="mt-6 grid gap-3">
        {landings.length === 0 ? (
          <p className="text-sm text-muted">{t("Aún no tienes landings.")}</p>
        ) : (
          landings.map((l) => (
            <Card key={l.id} className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-ink">
                    {l.title || l.slug}
                  </h3>
                  <Badge variant={l.status === "PUBLISHED" ? "success" : "muted"}>
                    {l.status === "PUBLISHED" ? t("Publicada") : t("Borrador")}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted">
                  /apps/ofertas/{l.slug}
                  {l.avatar ? ` · ${l.avatar}` : ""}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-1 text-xs text-muted">
                  <Icon name="eye" size={13} className="text-slate-500" />
                  {t("{count} vistas", {
                    count: l.views.toLocaleString(localeTag),
                  })}{" "}
                  ·
                  <Icon name="mouse-pointer" size={13} className="text-slate-500" />
                  {t("{count} clics", {
                    count: l.clicks.toLocaleString(localeTag),
                  })}
                  {l.views > 0 &&
                    t(" · {pct}% CTR", {
                      pct: ((l.clicks / l.views) * 100).toFixed(1),
                    })}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Link href={`/landings/${l.id}`}>
                  <Button variant="ghost" size="sm">
                    {t("Editar")}
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(l.id, l.title || l.slug)}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-error hover:bg-error/10"
                >
                  {t("Eliminar")}
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
