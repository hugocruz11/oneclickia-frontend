// Browser-side ePayco helpers: load the SDK scripts on demand, tokenize a
// card (raw card data never leaves the browser — only the token does), and
// open the hosted checkout for one-off payments (credit packs).

interface EpaycoToken {
  id?: string;
  token?: string;
}

interface EpaycoCheckoutHandler {
  open: (data: Record<string, unknown>) => void;
}

interface EpaycoGlobal {
  setPublicKey?: (key: string) => void;
  setTest?: (test: boolean) => void;
  token: {
    create: (
      form: HTMLFormElement,
      cb: (error: unknown, token: EpaycoToken | string) => void,
    ) => void;
  };
  checkout: {
    configure: (opts: { key: string; test: boolean }) => EpaycoCheckoutHandler;
  };
}

declare global {
  interface Window {
    ePayco?: EpaycoGlobal;
  }
}

const SCRIPTS = {
  token: "https://checkout.epayco.co/epayco.min.js",
  checkout: "https://checkout.epayco.co/checkout.js",
} as const;

const loading: Record<string, Promise<void> | undefined> = {};

function loadScript(src: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("ePayco solo está disponible en el navegador."));
  }
  const existing = loading[src];
  if (existing) return existing;

  const p = new Promise<void>((resolve, reject) => {
    if (document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () =>
      reject(new Error(`No se pudo cargar el script de ePayco (${src}).`));
    document.head.appendChild(s);
  });
  loading[src] = p;
  return p;
}

async function getEpayco(src: string): Promise<EpaycoGlobal> {
  await loadScript(src);
  const ep = window.ePayco;
  if (!ep) throw new Error("ePayco no está disponible en el navegador.");
  return ep;
}

/**
 * Tokenize a card form. `form` must contain the inputs marked with
 * `data-epayco="card[...]"`. Resolves with the one-time token string.
 */
export async function tokenizeCard(
  publicKey: string,
  test: boolean,
  form: HTMLFormElement,
): Promise<string> {
  const ep = await getEpayco(SCRIPTS.token);
  ep.setPublicKey?.(publicKey);
  ep.setTest?.(test);

  return new Promise<string>((resolve, reject) => {
    ep.token.create(form, (error, token) => {
      if (error) {
        reject(new Error(tokenError(error)));
        return;
      }
      const id =
        typeof token === "string" ? token : token?.id ?? token?.token;
      if (!id) {
        reject(new Error("ePayco no devolvió un token de tarjeta."));
        return;
      }
      resolve(id);
    });
  });
}

function tokenError(error: unknown): string {
  if (error && typeof error === "object") {
    const e = error as Record<string, unknown>;
    const list = (e.errors ?? e.data) as
      | Array<{ errorMessage?: string }>
      | undefined;
    if (Array.isArray(list) && list[0]?.errorMessage) {
      return list[0].errorMessage as string;
    }
    if (typeof e.message === "string") return e.message;
  }
  return "No se pudo validar la tarjeta. Revisa los datos e intenta de nuevo.";
}

export interface PackCheckoutParams {
  publicKey: string;
  test: boolean;
  /** Amount in `currency` units (e.g. dollars when currency is USD). */
  amount: number;
  currency: string;
  name: string;
  description: string;
  invoice: string;
  email?: string;
  /** Our user id, echoed back in the confirmation webhook (extra1). */
  userId: string;
  /** Pack id, echoed back in the confirmation webhook (extra2). */
  packId: string;
  confirmationUrl: string;
  responseUrl: string;
}

/** Open the ePayco hosted checkout for a one-off credit-pack purchase. */
export async function openPackCheckout(p: PackCheckoutParams): Promise<void> {
  const ep = await getEpayco(SCRIPTS.checkout);
  const handler = ep.checkout.configure({ key: p.publicKey, test: p.test });
  handler.open({
    name: p.name,
    description: p.description,
    invoice: p.invoice,
    currency: p.currency,
    amount: String(p.amount),
    tax_base: "0",
    tax: "0",
    country: "co",
    lang: "es",
    external: "false",
    confirmation: p.confirmationUrl,
    response: p.responseUrl,
    email: p.email ?? "",
    extra1: p.userId,
    extra2: p.packId,
    extra3: "topup",
  });
}
