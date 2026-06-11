"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api";
import { billingApi, formatUsd, type EpaycoConfig, type Plan } from "@/lib/billing";
import { tokenizeCard } from "@/lib/epayco";

const DOC_TYPES = [
  { value: "CC", label: "Cédula de ciudadanía" },
  { value: "CE", label: "Cédula de extranjería" },
  { value: "PPN", label: "Pasaporte" },
  { value: "NIT", label: "NIT" },
];

const inputClass =
  "w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink " +
  "placeholder:text-muted focus:border-orange focus:outline-none";

interface Props {
  plan: Plan;
  config: EpaycoConfig;
  defaultEmail?: string;
  defaultName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Card-capture modal for subscribing to a paid plan. The card is tokenized
 * in the browser with the ePayco SDK; only the token + the buyer document
 * reach our backend, which creates the recurring subscription.
 */
export function SubscribeModal({
  plan,
  config,
  defaultEmail,
  defaultName,
  onClose,
  onSuccess,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [docType, setDocType] = useState("CC");
  const [docNumber, setDocNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    setError("");
    setLoading(true);
    try {
      const token = await tokenizeCard(
        config.publicKey,
        config.test,
        formRef.current,
      );
      await billingApi.subscribe({
        tier: plan.tier,
        tokenCard: token,
        docType,
        docNumber,
        name: defaultName,
      });
      onSuccess();
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "No se pudo completar la suscripción.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-cream p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              Suscribirse a {plan.name}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {formatUsd(plan.priceUsdCents)}/mes ·{" "}
              {plan.monthlyCredits.toLocaleString("es")} créditos al mes
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-ink"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {config.test && (
          <p className="mt-3 rounded-md border border-warning/30 bg-warning/10 p-2 text-xs text-warning">
            Modo prueba: usa una tarjeta de test de ePayco. No se cobra dinero
            real.
          </p>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-charcoal">
              Nombre en la tarjeta
            </label>
            <input
              className={inputClass}
              data-epayco="card[name]"
              defaultValue={defaultName ?? ""}
              placeholder="Como aparece en la tarjeta"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-charcoal">Email</label>
            <input
              className={inputClass}
              data-epayco="card[email]"
              type="email"
              defaultValue={defaultEmail ?? ""}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-charcoal">
              Número de tarjeta
            </label>
            <input
              className={inputClass}
              data-epayco="card[number]"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="4575 6231 8229 0326"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-medium text-charcoal">Mes</label>
              <input
                className={inputClass}
                data-epayco="card[exp_month]"
                inputMode="numeric"
                placeholder="MM"
                maxLength={2}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-charcoal">Año</label>
              <input
                className={inputClass}
                data-epayco="card[exp_year]"
                inputMode="numeric"
                placeholder="AAAA"
                maxLength={4}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-charcoal">CVC</label>
              <input
                className={inputClass}
                data-epayco="card[cvc]"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="123"
                maxLength={4}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-medium text-charcoal">
                Documento
              </label>
              <select
                className={inputClass}
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
              >
                {DOC_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.value}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-charcoal">
                Número de documento
              </label>
              <input
                className={inputClass}
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                inputMode="numeric"
                placeholder="1234567890"
                required
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-error/20 bg-error/10 p-2">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <Button type="submit" loading={loading} size="lg" className="mt-1 w-full">
            Pagar {formatUsd(plan.priceUsdCents)}/mes
          </Button>
          <p className="text-center text-xs text-muted">
            Pago seguro procesado por ePayco. Tu suscripción se renueva
            automáticamente cada mes; puedes cancelarla cuando quieras.
          </p>
        </form>
      </div>
    </div>
  );
}
