"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  billingApi,
  type BillingSummary,
  type InsufficientCreditsDetail,
  INSUFFICIENT_CREDITS_EVENT,
} from "@/lib/billing";

// Feature flag global del sistema de créditos en el frontend. Cuando
// NEXT_PUBLIC_CREDITS_ENABLED='false' se oculta TODA la UI de créditos
// y planes (lanzamiento sin paywall). Habilitado por defecto.
export const CREDITS_ENABLED =
  process.env.NEXT_PUBLIC_CREDITS_ENABLED !== "false";

interface CreditsState {
  /** Si el sistema de créditos está activo (controla toda la UI). */
  enabled: boolean;
  summary: BillingSummary | null;
  isLoading: boolean;
  /** Re-fetch the balance + plan (e.g. after a paid action or checkout). */
  refresh: () => Promise<void>;
}

const CreditsContext = createContext<CreditsState>({
  enabled: CREDITS_ENABLED,
  summary: null,
  isLoading: true,
  refresh: async () => {},
});

export function CreditsProvider({ children }: { children: ReactNode }) {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [outOfCredits, setOutOfCredits] =
    useState<InsufficientCreditsDetail | null>(null);

  const refresh = useCallback(async () => {
    // Créditos desactivados → no cargamos nada.
    if (!CREDITS_ENABLED) {
      setIsLoading(false);
      return;
    }
    // No token yet → nothing to load (the API client would 401).
    if (
      typeof window !== "undefined" &&
      !localStorage.getItem("oneclickia_token")
    ) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await billingApi.me();
      setSummary(data);
    } catch {
      // Silent: the balance widget just won't render. Auth errors are
      // already handled globally by the API client.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Créditos desactivados → no escuchamos el evento ni refrescamos.
    if (!CREDITS_ENABLED) {
      setIsLoading(false);
      return;
    }
    void refresh();

    const onInsufficient = (e: Event) => {
      const detail = (e as CustomEvent<InsufficientCreditsDetail>).detail;
      setOutOfCredits(detail ?? {});
      // The action was rejected, so the balance is authoritative — refresh.
      void refresh();
    };
    // Keep the balance fresh when the user returns from the ePayco checkout.
    const onFocus = () => void refresh();

    window.addEventListener(INSUFFICIENT_CREDITS_EVENT, onInsufficient);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener(INSUFFICIENT_CREDITS_EVENT, onInsufficient);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  return (
    <CreditsContext.Provider
      value={{ enabled: CREDITS_ENABLED, summary, isLoading, refresh }}
    >
      {children}
      {CREDITS_ENABLED && outOfCredits && (
        <OutOfCreditsModal
          detail={outOfCredits}
          onClose={() => setOutOfCredits(null)}
        />
      )}
    </CreditsContext.Provider>
  );
}

function OutOfCreditsModal({
  detail,
  onClose,
}: {
  detail: InsufficientCreditsDetail;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <Card className="w-full max-w-md shadow-lg" padding="lg">
        {/* Stop the overlay's onClose from firing when clicking inside. */}
        <div onClick={(e) => e.stopPropagation()}>
          <h2 className="text-lg font-semibold text-ink">
            Te quedaste sin créditos
          </h2>
          <p className="mt-2 text-sm text-muted">
            {typeof detail.required === "number" &&
            typeof detail.available === "number"
              ? `Esta acción necesita ${detail.required} créditos y te quedan ${detail.available}.`
              : "No tienes créditos suficientes para esta acción."}{" "}
            Sube de plan o compra un paquete de créditos para continuar.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/plans" className="flex-1" onClick={onClose}>
              <Button className="w-full">Ver planes y créditos</Button>
            </Link>
            <Button variant="ghost" onClick={onClose}>
              Ahora no
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function useCredits() {
  return useContext(CreditsContext);
}
