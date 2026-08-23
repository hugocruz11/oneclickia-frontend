"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ListControls";
import { api, ApiError } from "@/lib/api";
import { RichText } from "@/components/RichText";
import { useT } from "@/contexts/I18nContext";

// Cuántos productos por página en la lista de Shopify.
const PRODUCTS_PAGE_SIZE = 8;

interface ShopifySetup {
  redirectUrl: string;
  proxyUrl: string;
  proxyPrefix: string;
  proxySubpath: string;
  scopes: string;
}

interface ShopifyStatus {
  connected: boolean;
  pending: boolean;
  shop?: string;
  scope?: string | null;
  setup: ShopifySetup;
}

interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  featuredImageUrl: string | null;
  minPrice: string;
  currencyCode: string;
}

/** Fila copiable: etiqueta + valor monoespaciado + botón "Copiar". */
function CopyableField({ label, value }: { label: string; value: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <p className="text-xs font-medium text-charcoal">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <code className="flex-1 overflow-x-auto rounded-md border border-sand bg-sand-light px-2 py-1.5 text-xs text-ink">
          {value}
        </code>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="shrink-0 rounded-md border border-sand bg-cream px-2 py-1.5 text-xs font-medium text-charcoal transition-colors hover:bg-sand-light"
        >
          {copied ? t("✓ Copiado") : t("Copiar")}
        </button>
      </div>
    </div>
  );
}

export function ShopifyConnectionPanel() {
  const t = useT();
  const [status, setStatus] = useState<ShopifyStatus | null>(null);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [productPage, setProductPage] = useState(0);
  const [shopInput, setShopInput] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [apiSecretInput, setApiSecretInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState<"connected" | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "true") setBanner("connected");
    const cbError = params.get("error");
    if (cbError) setError(cbError);
    loadStatus();
  }, []);

  async function loadStatus() {
    try {
      const res = await api.get<ShopifyStatus>("/connections/shopify/status");
      setStatus(res);
      if (res.connected) void loadProducts();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al cargar el estado.");
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    try {
      const res = await api.get<ShopifyProduct[]>("/connections/shopify/products");
      setProducts(res);
      setProductPage(0);
    } catch {
      // Non-fatal: status still shows connected; products may load later.
    }
  }

  async function handleConnect() {
    if (!shopInput.trim() || !apiKeyInput.trim() || !apiSecretInput.trim()) {
      setError(
        "Completa el dominio de la tienda, la API key y el API secret de tu app.",
      );
      return;
    }
    setConnecting(true);
    setError("");
    try {
      const res = await api.post<{ authorizationUrl: string }>(
        "/connections/shopify/initiate",
        {
          shop: shopInput.trim(),
          apiKey: apiKeyInput.trim(),
          apiSecret: apiSecretInput.trim(),
        },
      );
      // Redirige a la tienda para instalar/autorizar la app del cliente.
      window.location.href = res.authorizationUrl;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al iniciar la conexión.");
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    setError("");
    try {
      await api.delete("/connections/shopify");
      await loadStatus();
      setProducts([]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al desconectar.");
    } finally {
      setDisconnecting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const setup = status?.setup;
  const isConnected = status?.connected;

  return (
    <div>
      <p className="text-sm text-muted">
        {t(
          "Conecta tu tienda para crear landing pages por avatar bajo tu propio dominio y enlazarlas a tus productos.",
        )}
      </p>

      {banner === "connected" && (
        <div className="mt-4 rounded-md border border-success/20 bg-success/10 p-3">
          <p className="text-sm text-success-text">
            {t("¡Tienda Shopify conectada!")}
          </p>
        </div>
      )}
      {error && (
        <div role="alert" className="mt-4 rounded-md border border-error/20 bg-error/10 p-3">
          <p className="text-sm text-error">{t(error)}</p>
        </div>
      )}

      {/* Estado de la conexión */}
      <Card className="mt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-ink">{t("Conexión")}</h2>
            <Badge
              variant={
                isConnected ? "success" : status?.pending ? "warning" : "muted"
              }
            >
              {isConnected
                ? t("Conectada")
                : status?.pending
                  ? t("Instalación pendiente")
                  : t("Desconectada")}
            </Badge>
          </div>
          {(isConnected || status?.pending) && (
            <Button
              variant="ghost"
              onClick={handleDisconnect}
              loading={disconnecting}
              size="sm"
            >
              {t("Desconectar")}
            </Button>
          )}
        </div>

        {isConnected && (
          <p className="mt-3 text-sm text-charcoal">
            <span className="font-medium text-ink">{t("Tienda:")}</span>{" "}
            {status?.shop}
          </p>
        )}
        {status?.pending && (
          <p className="mt-3 text-sm text-charcoal">
            <RichText vars={{ shop: status.shop ?? "" }}>
              {"Guardamos las credenciales de **{shop}**, pero falta terminar de instalar la app. Vuelve a pulsar “Conectar” para autorizar la instalación en tu tienda."}
            </RichText>
          </p>
        )}
      </Card>

      {/* Instrucciones + formulario (solo si no está conectada) */}
      {!isConnected && setup && (
        <>
          <Card className="mt-4">
            <h2 className="text-base font-semibold text-ink">
              {t("Paso 1 · Crea y configura tu app en Shopify")}
            </h2>

            <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm text-charcoal">
              <li>
                {t("Entra a")}{" "}
                <a
                  href="https://dev.shopify.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-orange hover:underline"
                >
                  dev.shopify.com/dashboard
                </a>{" "}
                → <strong>Apps</strong>.
              </li>
              <li>
                <RichText>
                  {"Abajo a la derecha, haz clic en el botón **“Crear app”** (en la barra “Obtén credenciales de la API”). *No* uses la opción de CLI (`npm init…`)."}
                </RichText>
              </li>
              <li>
                <RichText>
                  {"Ponle un nombre a la app (ej. “OneClickIA”). Al crearla, Shopify te lleva automáticamente a la página de configuración (la **“versión”** de la app) — ahí va todo lo siguiente."}
                </RichText>
              </li>
              <li>
                <RichText>
                  {"En **URL de la app** pon cualquier URL https válida (no la usamos). Puedes pegar la misma URL del proxy de abajo."}
                </RichText>
              </li>
              <li>
                <RichText>
                  {"**Desmarca** la casilla **“Incrustar la app en el panel de control de Shopify”** (nuestra app no va incrustada en el admin)."}
                </RichText>
              </li>
              <li>
                <RichText vars={{ scopes: setup.scopes }}>
                  {"En **Acceso → Alcances** escribe: `{scopes}`."}
                </RichText>
              </li>
              <li>
                <RichText>
                  {"**Marca** la casilla **“Usar flujo de instalación heredado”**."}
                </RichText>{" "}
                <Icon name="alert-triangle" size={14} className="inline align-text-bottom text-warning" />{" "}
                {t(
                  "Es obligatoria: habilita el flujo OAuth con redirección que usamos.",
                )}
              </li>
              <li>
                <RichText>
                  {"En **URLs de redireccionamiento** pega:"}
                </RichText>
              </li>
            </ol>
            <div className="mt-3">
              <CopyableField
                label={t("URL de redireccionamiento")}
                value={setup.redirectUrl}
              />
            </div>

            <ol
              className="mt-4 flex list-decimal flex-col gap-2 pl-5 text-sm text-charcoal"
              start={9}
            >
              <li>
                <RichText>
                  {"Despliega **Proxy de la app** (al final del formulario) y pon estos tres valores (así las landings se sirven bajo tu dominio):"}
                </RichText>
              </li>
            </ol>
            <div className="mt-3 flex flex-col gap-3">
              <CopyableField
                label={t("Prefijo de subruta")}
                value={setup.proxyPrefix}
              />
              <CopyableField label={t("Subruta")} value={setup.proxySubpath} />
              <CopyableField label={t("URL de proxy")} value={setup.proxyUrl} />
            </div>

            <ol
              className="mt-4 flex list-decimal flex-col gap-2 pl-5 text-sm text-charcoal"
              start={10}
            >
              <li>
                <RichText>
                  {"Haz clic en **Publicar**. Se abrirá la ventana “¿Publicar esta versión nueva?” con dos campos **opcionales** (solo etiquetas internas, no afectan la conexión). Puedes dejarlos vacíos, o copiar estos:"}
                </RichText>
                <div className="mt-2 flex flex-col gap-3">
                  <CopyableField
                    label={t("Nombre de la versión")}
                    value="oneclickia-v1"
                  />
                  <CopyableField
                    label={t("Mensaje de la versión")}
                    value="OAuth y App Proxy (ofertas) para OneClickIA"
                  />
                </div>
                <span className="mt-1 block text-xs text-muted">
                  {t(
                    "El nombre solo admite letras, números y guiones (sin espacios ni acentos).",
                  )}
                </span>
                <RichText>{"Luego confirma con **Publicar**."}</RichText>
              </li>
              <li>
                <RichText>
                  {"Tras publicar, en el **menú lateral izquierdo** de la app haz clic en **Configuración**."}
                </RichText>
              </li>
              <li>
                <RichText>{"En la sección **Credenciales**:"}</RichText>
                <ul className="mt-1 list-disc pl-5 text-xs text-muted">
                  <li>
                    <RichText>
                      {"**ID de cliente** → cópialo (es tu **API key**)."}
                    </RichText>
                  </li>
                  <li>
                    <RichText>{"**Secreto** → haz clic en el **ojo**"}</RichText>{" "}
                    <Icon name="eye" size={13} className="inline align-text-bottom" />{" "}
                    <RichText>
                      {"para revelarlo y cópialo (es tu **API secret**)."}
                    </RichText>
                  </li>
                </ul>
                <RichText>{"Pega ambos en el **Paso 2**."}</RichText>
              </li>
            </ol>
          </Card>

          <Card className="mt-4">
            <h2 className="text-base font-semibold text-ink">
              {t("Paso 2 · Pega los datos de tu app")}
            </h2>
            <div className="mt-4 flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-charcoal">
                  {t("Dominio de tu tienda")}
                </label>
                <input
                  className="mt-1 w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-orange focus:outline-none"
                  placeholder="tutienda.myshopify.com"
                  value={shopInput}
                  onChange={(e) => setShopInput(e.target.value)}
                />
                <p className="mt-1 text-xs text-muted">
                  <RichText>
                    {"Es tu dominio `.myshopify.com` (no tu dominio personalizado). Lo encuentras en tu admin de Shopify → **Configuración → Dominios**, o en la URL `admin.shopify.com/store/<nombre>` (tu dominio es `<nombre>.myshopify.com`)."}
                  </RichText>
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-charcoal">
                  {t("API key")}
                </label>
                <input
                  className="mt-1 w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-orange focus:outline-none"
                  placeholder={t("ej. 1a2b3c4d5e6f...")}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-charcoal">
                  {t("API secret key")}
                </label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-orange focus:outline-none"
                  placeholder="ej. shpss_..."
                  value={apiSecretInput}
                  onChange={(e) => setApiSecretInput(e.target.value)}
                />
              </div>
              <div>
                <Button onClick={handleConnect} loading={connecting}>
                  {t("Conectar e instalar")}
                </Button>
                <p className="mt-2 text-xs text-muted">
                  {t(
                    "Te llevaremos a tu tienda para autorizar la instalación de tu app. Al volver, la conexión quedará lista.",
                  )}
                </p>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Productos (solo conectada) */}
      {isConnected && (
        <Card className="mt-4">
          <h3 className="text-sm font-semibold text-ink">
            {t("Productos ({count})", { count: products.length })}
          </h3>
          {products.length === 0 ? (
            <p className="mt-2 text-sm text-muted">
              {t("No se encontraron productos (o aún cargando).")}
            </p>
          ) : (
            <>
              <ul className="mt-3 flex flex-col divide-y divide-sand">
                {products
                  .slice(
                    productPage * PRODUCTS_PAGE_SIZE,
                    productPage * PRODUCTS_PAGE_SIZE + PRODUCTS_PAGE_SIZE,
                  )
                  .map((p) => (
                    <li key={p.id} className="flex items-center gap-3 py-2">
                      {p.featuredImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.featuredImageUrl}
                          alt={p.title}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-sand" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-ink">{p.title}</p>
                        <p className="text-xs text-muted">
                          {p.minPrice} {p.currencyCode}
                        </p>
                      </div>
                    </li>
                  ))}
              </ul>
              <Pagination
                page={productPage}
                totalItems={products.length}
                pageSize={PRODUCTS_PAGE_SIZE}
                onPageChange={setProductPage}
              />
            </>
          )}
        </Card>
      )}
    </div>
  );
}
