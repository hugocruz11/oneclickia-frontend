"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ListControls";
import { api, ApiError } from "@/lib/api";

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
          {copied ? "✓ Copiado" : "Copiar"}
        </button>
      </div>
    </div>
  );
}

export function ShopifyConnectionPanel() {
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
        Conecta tu tienda para crear landing pages por avatar bajo tu propio
        dominio y enlazarlas a tus productos.
      </p>

      {banner === "connected" && (
        <div className="mt-4 rounded-md border border-success/20 bg-success/10 p-3">
          <p className="text-sm text-success-text">¡Tienda Shopify conectada!</p>
        </div>
      )}
      {error && (
        <div role="alert" className="mt-4 rounded-md border border-error/20 bg-error/10 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {/* Estado de la conexión */}
      <Card className="mt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-ink">Conexión</h2>
            <Badge
              variant={
                isConnected ? "success" : status?.pending ? "warning" : "muted"
              }
            >
              {isConnected
                ? "Conectada"
                : status?.pending
                  ? "Instalación pendiente"
                  : "Desconectada"}
            </Badge>
          </div>
          {(isConnected || status?.pending) && (
            <Button
              variant="ghost"
              onClick={handleDisconnect}
              loading={disconnecting}
              size="sm"
            >
              Desconectar
            </Button>
          )}
        </div>

        {isConnected && (
          <p className="mt-3 text-sm text-charcoal">
            <span className="font-medium text-ink">Tienda:</span> {status?.shop}
          </p>
        )}
        {status?.pending && (
          <p className="mt-3 text-sm text-charcoal">
            Guardamos las credenciales de <strong>{status.shop}</strong>, pero
            falta terminar de instalar la app. Vuelve a pulsar “Conectar” para
            autorizar la instalación en tu tienda.
          </p>
        )}
      </Card>

      {/* Instrucciones + formulario (solo si no está conectada) */}
      {!isConnected && setup && (
        <>
          <Card className="mt-4">
            <h2 className="text-base font-semibold text-ink">
              Paso 1 · Crea y configura tu app en Shopify
            </h2>

            <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm text-charcoal">
              <li>
                Entra a{" "}
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
                Abajo a la derecha, haz clic en el botón{" "}
                <strong>“Crear app”</strong> (en la barra “Obtén credenciales de
                la API”). <em>No</em> uses la opción de CLI (
                <code className="text-xs">npm init…</code>).
              </li>
              <li>
                Ponle un nombre a la app (ej. “OneClickIA”). Al crearla, Shopify
                te lleva automáticamente a la página de configuración
                (la <strong>“versión”</strong> de la app) — ahí va todo lo
                siguiente.
              </li>
              <li>
                En <strong>URL de la app</strong> pon cualquier URL https válida
                (no la usamos). Puedes pegar la misma URL del proxy de abajo.
              </li>
              <li>
                <strong>Desmarca</strong> la casilla{" "}
                <strong>“Incrustar la app en el panel de control de Shopify”</strong>{" "}
                (nuestra app no va incrustada en el admin).
              </li>
              <li>
                En <strong>Acceso → Alcances</strong> escribe:{" "}
                <code className="rounded bg-sand-light px-1 py-0.5 text-xs">
                  {setup.scopes}
                </code>
                .
              </li>
              <li>
                <strong>Marca</strong> la casilla{" "}
                <strong>“Usar flujo de instalación heredado”</strong>.{" "}
                <Icon name="alert-triangle" size={14} className="inline align-text-bottom text-warning" /> Es
                obligatoria: habilita el flujo OAuth con redirección que usamos.
              </li>
              <li>
                En <strong>URLs de redireccionamiento</strong> pega:
              </li>
            </ol>
            <div className="mt-3">
              <CopyableField
                label="URL de redireccionamiento"
                value={setup.redirectUrl}
              />
            </div>

            <ol
              className="mt-4 flex list-decimal flex-col gap-2 pl-5 text-sm text-charcoal"
              start={9}
            >
              <li>
                Despliega <strong>Proxy de la app</strong> (al final del
                formulario) y pon estos tres valores (así las landings se sirven
                bajo tu dominio):
              </li>
            </ol>
            <div className="mt-3 flex flex-col gap-3">
              <CopyableField label="Prefijo de subruta" value={setup.proxyPrefix} />
              <CopyableField label="Subruta" value={setup.proxySubpath} />
              <CopyableField label="URL de proxy" value={setup.proxyUrl} />
            </div>

            <ol
              className="mt-4 flex list-decimal flex-col gap-2 pl-5 text-sm text-charcoal"
              start={10}
            >
              <li>
                Haz clic en <strong>Publicar</strong>. Se abrirá la ventana
                “¿Publicar esta versión nueva?” con dos campos{" "}
                <strong>opcionales</strong> (solo etiquetas internas, no afectan
                la conexión). Puedes dejarlos vacíos, o copiar estos:
                <div className="mt-2 flex flex-col gap-3">
                  <CopyableField
                    label="Nombre de la versión"
                    value="oneclickia-v1"
                  />
                  <CopyableField
                    label="Mensaje de la versión"
                    value="OAuth y App Proxy (ofertas) para OneClickIA"
                  />
                </div>
                <span className="mt-1 block text-xs text-muted">
                  El nombre solo admite letras, números y guiones (sin espacios
                  ni acentos).
                </span>
                Luego confirma con <strong>Publicar</strong>.
              </li>
              <li>
                Tras publicar, en el <strong>menú lateral izquierdo</strong> de
                la app haz clic en <strong>Configuración</strong>.
              </li>
              <li>
                En la sección <strong>Credenciales</strong>:
                <ul className="mt-1 list-disc pl-5 text-xs text-muted">
                  <li>
                    <strong>ID de cliente</strong> → cópialo (es tu{" "}
                    <strong>API key</strong>).
                  </li>
                  <li>
                    <strong>Secreto</strong> → haz clic en el{" "}
                    <strong>
                      ojo{" "}
                      <Icon name="eye" size={13} className="inline align-text-bottom" />
                    </strong>{" "}
                    para revelarlo y cópialo (es tu <strong>API secret</strong>).
                  </li>
                </ul>
                Pega ambos en el <strong>Paso 2</strong>.
              </li>
            </ol>
          </Card>

          <Card className="mt-4">
            <h2 className="text-base font-semibold text-ink">
              Paso 2 · Pega los datos de tu app
            </h2>
            <div className="mt-4 flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-charcoal">
                  Dominio de tu tienda
                </label>
                <input
                  className="mt-1 w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-orange focus:outline-none"
                  placeholder="tutienda.myshopify.com"
                  value={shopInput}
                  onChange={(e) => setShopInput(e.target.value)}
                />
                <p className="mt-1 text-xs text-muted">
                  Es tu dominio <code className="text-xs">.myshopify.com</code>{" "}
                  (no tu dominio personalizado). Lo encuentras en tu admin de
                  Shopify → <strong>Configuración → Dominios</strong>, o en la
                  URL <code className="text-xs">admin.shopify.com/store/&lt;nombre&gt;</code>{" "}
                  (tu dominio es <code className="text-xs">&lt;nombre&gt;.myshopify.com</code>).
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-charcoal">
                  API key
                </label>
                <input
                  className="mt-1 w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-orange focus:outline-none"
                  placeholder="ej. 1a2b3c4d5e6f..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-charcoal">
                  API secret key
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
                  Conectar e instalar
                </Button>
                <p className="mt-2 text-xs text-muted">
                  Te llevaremos a tu tienda para autorizar la instalación de tu
                  app. Al volver, la conexión quedará lista.
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
            Productos ({products.length})
          </h3>
          {products.length === 0 ? (
            <p className="mt-2 text-sm text-muted">
              No se encontraron productos (o aún cargando).
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
