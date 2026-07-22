"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MultiFileUpload } from "@/components/ui/MultiFileUpload";
import { Textarea } from "@/components/ui/Textarea";
import { Spinner } from "@/components/ui/Spinner";
import { api, ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";

// ─── Step model ───────────────────────────────────────────────────

interface WizardState {
  name: string;
  description: string;
  composition: string;
  notProduct: string;
  featuresBenefits: string;
  usp: string;
  mechanism: string;
  usageRitual: string;
  priceJustification: string;
  customerAvatar: string;
  customerVoice: string;
}

const EMPTY_STATE: WizardState = {
  name: "",
  description: "",
  composition: "",
  notProduct: "",
  featuresBenefits: "",
  usp: "",
  mechanism: "",
  usageRitual: "",
  priceJustification: "",
  customerAvatar: "",
  customerVoice: "",
};

function hydrate(product: Product): WizardState {
  return {
    name: product.name ?? "",
    description: product.description ?? "",
    composition: product.composition ?? "",
    notProduct: product.notProduct ?? "",
    featuresBenefits: product.featuresBenefits ?? "",
    usp: product.usp ?? "",
    mechanism: product.mechanism ?? "",
    usageRitual: product.usageRitual ?? "",
    priceJustification: product.priceJustification ?? "",
    customerAvatar: product.customerAvatar ?? "",
    customerVoice: product.customerVoice ?? "",
  };
}

const TOTAL_STEPS = 5;

const STEP_REQUIRED: Record<number, (keyof WizardState)[]> = {
  1: ["name"],
  2: ["description", "composition", "notProduct"],
  3: ["featuresBenefits", "usp", "mechanism"],
  4: ["usageRitual", "priceJustification"],
  5: ["customerAvatar", "customerVoice"],
};

function resumeStep(state: WizardState): number {
  for (let step = 1; step <= TOTAL_STEPS; step++) {
    const required = STEP_REQUIRED[step];
    const missing = required.some((k) => !state[k] || state[k].trim().length === 0);
    if (missing) return step;
  }
  return TOTAL_STEPS;
}

// ─── Page ─────────────────────────────────────────────────────────

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params.id;

  const [bootstrapped, setBootstrapped] = useState(false);
  const [state, setState] = useState<WizardState>(EMPTY_STATE);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { product } = await api.get<{ product: Product }>(
          `/products/${productId}`,
        );
        const hydrated = hydrate(product);
        setState(hydrated);
        setImageUrls([product.imageUrl, ...(product.extraImageUrls ?? [])]);
        setStep(resumeStep(hydrated));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "No se pudo cargar el producto.");
      } finally {
        setBootstrapped(true);
      }
    }
    void load();
  }, [productId]);

  function update<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  async function saveStep(extras: Record<string, unknown> = {}): Promise<boolean> {
    const required = STEP_REQUIRED[step];
    for (const key of required) {
      if (!state[key] || state[key].trim().length === 0) {
        setError("Completa todas las preguntas para continuar.");
        return false;
      }
    }

    setSaving(true);
    setError("");

    try {
      if (step === 1 && newImages.length) {
        // Step 1 may replace the images — use multipart.
        const formData = new FormData();
        formData.append("name", state.name.trim());
        newImages.forEach((img) => formData.append("images", img));
        const { product } = await api.patch<{ product: Product }>(
          `/products/${productId}`,
          formData,
        );
        setImageUrls([product.imageUrl, ...(product.extraImageUrls ?? [])]);
        setNewImages([]);
      } else {
        // Otherwise JSON patch with only the fields for the current step.
        const payload: Record<string, unknown> = { ...extras };
        for (const key of required) {
          payload[key] = state[key].trim();
        }
        await api.patch<{ product: Product }>(`/products/${productId}`, payload);
      }
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleStepSubmit(e: FormEvent) {
    e.preventDefault();
    const ok = await saveStep();
    if (!ok) return;
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      router.replace("/products");
    }
  }

  if (!bootstrapped) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link
          href="/products"
          className="text-xs text-muted hover:text-orange"
        >
          ← Volver a productos
        </Link>
      </div>

      <ProgressBar current={step} total={TOTAL_STEPS} onClickStep={setStep} />

      <Card padding="lg">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Paso {step} de {TOTAL_STEPS}
        </span>

        {step === 1 && (
          <Step1
            state={state}
            update={update}
            imageUrls={imageUrls}
            newImages={newImages}
            setNewImages={setNewImages}
            onSubmit={handleStepSubmit}
            saving={saving}
            error={error}
          />
        )}
        {step === 2 && (
          <Step2
            state={state}
            update={update}
            onSubmit={handleStepSubmit}
            onBack={() => setStep(1)}
            saving={saving}
            error={error}
          />
        )}
        {step === 3 && (
          <Step3
            state={state}
            update={update}
            onSubmit={handleStepSubmit}
            onBack={() => setStep(2)}
            saving={saving}
            error={error}
          />
        )}
        {step === 4 && (
          <Step4
            state={state}
            update={update}
            onSubmit={handleStepSubmit}
            onBack={() => setStep(3)}
            saving={saving}
            error={error}
          />
        )}
        {step === 5 && (
          <Step5
            state={state}
            update={update}
            onSubmit={handleStepSubmit}
            onBack={() => setStep(4)}
            saving={saving}
            error={error}
          />
        )}
      </Card>
    </div>
  );
}

// ─── Shared building blocks ───────────────────────────────────────

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mt-2">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm text-muted">{subtitle}</p>
    </div>
  );
}

function FormShell({
  onSubmit,
  children,
}: {
  onSubmit: (e: FormEvent) => void;
  children: ReactNode;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-5" noValidate>
      {children}
    </form>
  );
}

function ErrorBox({ error }: { error: string }) {
  if (!error) return null;
  return (
    <div className="rounded-md border border-error/20 bg-error/10 p-3">
      <p className="text-sm text-error">{error}</p>
    </div>
  );
}

function StepFooter({
  onBack,
  saving,
  primaryLabel,
}: {
  onBack?: () => void;
  saving: boolean;
  primaryLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sand pt-5">
      {onBack ? (
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          ← Atrás
        </Button>
      ) : (
        <span />
      )}
      <Button type="submit" size="md" loading={saving}>
        {primaryLabel}
      </Button>
    </div>
  );
}

function ProgressBar({
  current,
  total,
  onClickStep,
}: {
  current: number;
  total: number;
  onClickStep: (step: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onClickStep(n)}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            n <= current ? "bg-orange" : "bg-sand"
          } ${n < current ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
          disabled={n > current}
          aria-label={`Paso ${n}`}
        />
      ))}
      <span className="text-xs font-medium text-muted">
        {current} / {total}
      </span>
    </div>
  );
}

// ─── Steps ─────────────────────────────────────────────────────────

interface StepProps {
  state: WizardState;
  update: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
  onSubmit: (e: FormEvent) => void;
  onBack?: () => void;
  saving: boolean;
  error: string;
}

function Step1({
  state,
  update,
  imageUrls,
  newImages,
  setNewImages,
  onSubmit,
  saving,
  error,
}: StepProps & {
  imageUrls: string[];
  newImages: File[];
  setNewImages: (f: File[]) => void;
}) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const srcOf = (url: string) =>
    url.startsWith("http") ? url : `${apiBase}${url}`;

  return (
    <>
      <StepHeader
        title="Básicos del producto"
        subtitle="Confirma el nombre y las imágenes. Para cambiarlas, sube nuevas (reemplazan todas)."
      />
      <FormShell onSubmit={onSubmit}>
        <Input
          label="Nombre del producto *"
          value={state.name}
          onChange={(e) => update("name", e.target.value)}
          required
        />

        {imageUrls.length > 0 && newImages.length === 0 && (
          <div className="rounded-md border border-sand bg-cream p-4">
            <p className="mb-3 text-sm text-muted">
              Imágenes actuales. Para reemplazarlas, sube nuevas abajo.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {imageUrls.map((url, i) => (
                <div
                  key={url}
                  className="relative aspect-square overflow-hidden rounded-md border border-sand"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={srcOf(url)}
                    alt={`Imagen ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-orange px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      Principal
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <MultiFileUpload
          label={
            newImages.length ? "Nuevas imágenes" : "Reemplazar imágenes (opcional)"
          }
          value={newImages}
          onChange={setNewImages}
          max={3}
          helperText="Si subes imágenes aquí, sobrescriben las actuales al guardar."
        />

        <ErrorBox error={error} />
        <StepFooter saving={saving} primaryLabel="Guardar y continuar →" />
      </FormShell>
    </>
  );
}

function Step2({ state, update, onSubmit, onBack, saving, error }: StepProps) {
  return (
    <>
      <StepHeader
        title="¿Qué es y de qué está hecho?"
        subtitle="Atributos físicos, composición y anti-posicionamiento. Es la base material del producto."
      />
      <FormShell onSubmit={onSubmit}>
        <Textarea
          label="1. ¿Qué es este producto? *"
          placeholder='Ej: Jeans tiro alto. Denim stretch 98% algodón / 2% lycra. Tallas 26-38. Colores: negro, azul stone, gris pizarra, camel. Largo 30 y 32. Corte recto. Costuras en hilo mostaza.'
          value={state.description}
          onChange={(e) => update("description", e.target.value)}
          helperText="Tipo de objeto/servicio + atributos físicos: colores, tamaños, materiales, dimensiones, presentaciones."
          rows={6}
        />
        <Textarea
          label="2. ¿De qué está hecho o qué lo compone? *"
          placeholder='Ej: Espuma HD-36 (soporte lumbar sin hundirse) + malla transpirable (no acalora la espalda en jornadas largas) + base aluminio 5 ruedas (gira 360° sin rayar el piso).'
          value={state.composition}
          onChange={(e) => update("composition", e.target.value)}
          helperText="Materiales, ingredientes, tecnologías clave — cada uno con su función y el beneficio que da al usuario."
          rows={6}
        />
        <Textarea
          label="3. ¿Qué NO es este producto? *"
          placeholder='Ej: No es sustituto de comidas, no es para bajar de peso, no es un detox agresivo.'
          value={state.notProduct}
          onChange={(e) => update("notProduct", e.target.value)}
          helperText="El anti-posicionamiento del producto es el copy más diferenciador."
          rows={4}
        />
        <ErrorBox error={error} />
        <StepFooter onBack={onBack} saving={saving} primaryLabel="Guardar y continuar →" />
      </FormShell>
    </>
  );
}

function Step3({ state, update, onSubmit, onBack, saving, error }: StepProps) {
  return (
    <>
      <StepHeader
        title="USP y mecanismo"
        subtitle="La propuesta única y por qué funciona el producto. Aquí vive el corazón del anuncio."
      />
      <FormShell onSubmit={onSubmit}>
        <Textarea
          label="4. Features → beneficio funcional → beneficio emocional *"
          placeholder='Ej: Pesa 400g → Caminas 8h sin dolor de espalda → Llegar al destino con energía, no agotada.'
          value={state.featuresBenefits}
          onChange={(e) => update("featuresBenefits", e.target.value)}
          helperText="Las 5 características más importantes. Formato: Característica → Funcional → Emocional. Incluye beneficio de identidad (en quién se convierte el usuario)."
          rows={8}
        />
        <Textarea
          label="5. USP del producto *"
          placeholder='Ej: El único zapato que se ve elegante y no destruye tus pies en 8 horas de pie. Filosófica: elegancia y comodidad no son opuestos. Funcional: suela de amortiguación 3 capas. Emocional: llegar a casa sin sentir los pies. Hook: "Elegante. Sin dolor." Subtítulo: "El zapato que los médicos usan cuando nadie los mira."'
          value={state.usp}
          onChange={(e) => update("usp", e.target.value)}
          helperText="USP en una oración + 3 capas (filosófica, funcional, emocional) + 3 formatos: hook 3-5 palabras, subtítulo landing 8-15 palabras, body 40-60 palabras."
          rows={8}
        />
        <Textarea
          label="6. ¿Por qué funciona este producto? *"
          placeholder='Ej: Simple: "La mayoría de colchones crea puntos de presión que te despiertan. Este los redistribuye." Técnico: "La espuma viscoelástica detecta puntos de tensión y los absorbe uniformemente." Narrativo: "Llevamos décadas durmiendo como nos dijeron. Nosotros preguntamos: ¿y si el colchón se adaptara al cuerpo?"'
          value={state.mechanism}
          onChange={(e) => update("mechanism", e.target.value)}
          helperText="Mecanismo en 3 niveles: Simple (2 frases para hook), Técnico (landing/email), Narrativo (brand video / founder story)."
          rows={6}
        />
        <ErrorBox error={error} />
        <StepFooter onBack={onBack} saving={saving} primaryLabel="Guardar y continuar →" />
      </FormShell>
    </>
  );
}

function Step4({ state, update, onSubmit, onBack, saving, error }: StepProps) {
  return (
    <>
      <StepHeader
        title="Uso y precio"
        subtitle="Cómo se vive el producto y cómo se justifica lo que cuesta."
      />
      <FormShell onSubmit={onSubmit}>
        <Textarea
          label="7. ¿Cómo se usa, se lleva puesto o se experimenta? *"
          placeholder='Ej: Primario: noche, 20 min de ritual propio después de acostar a los hijos. Enciende con cerillos, no encendedor. Dura 50 horas. Secundario: decoración en cenas. Situacional: regalo de cumpleaños, regalo corporativo. Estacional: Día de la Madre, Navidad.'
          value={state.usageRitual}
          onChange={(e) => update("usageRitual", e.target.value)}
          helperText="Ritual completo: momento del día, frecuencia, pasos, tiempo. Incluye casos de uso secundarios, situacionales y de regalo."
          rows={6}
        />
        <Textarea
          label="8. ¿Cuánto cuesta y cómo se justifica el precio? *"
          placeholder='Ej: $380.000 / 5 años / 365 días = $208 por día. Reframe 1 vs. fast fashion: dura 5 años, no 1 temporada. Reframe 2 cotidiano: menos que el café del mes. Reframe 3 inversión: primera impresión en entrevistas. Reframe 4 costo de no tenerla: comprar algo de emergencia en el aeropuerto. Garantía: cambio gratis 30 días.'
          value={state.priceJustification}
          onChange={(e) => update("priceJustification", e.target.value)}
          helperText="Precio desagregado (por uso/día/porción) + 4 reframes + garantía o política de devolución."
          rows={6}
        />
        <ErrorBox error={error} />
        <StepFooter onBack={onBack} saving={saving} primaryLabel="Guardar y continuar →" />
      </FormShell>
    </>
  );
}

function Step5({ state, update, onSubmit, onBack, saving, error }: StepProps) {
  return (
    <>
      <StepHeader
        title="Cliente y voz"
        subtitle="Quién compra el producto y con qué palabras habla de su problema. Aquí está el copy más poderoso."
      />
      <FormShell onSubmit={onSubmit}>
        <Textarea
          label="9. ¿Quién compra este producto? Avatar completo *"
          placeholder='Ej: Andrés, 34, Bogotá, ingeniero remoto, $5.5M/mes. JTBD funcional: no terminar el día con dolor. Emocional: sentir oficina seria en casa. Social: que sus clientes vean profesionalismo. Trigger: lleva 3 semanas con dolor. FEEL antes: "llego a las 3pm destrozado". FEEL después: "termino el día con energía". BELIEVE antes: "la silla no importa tanto". BELIEVE después: "el entorno de trabajo es parte del rendimiento".'
          value={state.customerAvatar}
          onChange={(e) => update("customerAvatar", e.target.value)}
          helperText="Avatar (nombre mental, edad, ciudad, ingresos, ocupación) + JTBD (funcional, emocional, social) + 3 triggers que detonan la compra + Before/After en 5 dimensiones (HAVE, FEEL, STATUS, CAN DO, BELIEVE)."
          rows={10}
        />
        <Textarea
          label="10. ¿Qué dicen los clientes sobre este producto? *"
          placeholder='Ej: "llevo 3 meses usándolos trabajando de pie y ya no llego destruido a casa". Objeción: "$280.000 es mucho para un zapato" → Contraargumento: es el costo de 1 sesión de fisioterapia. Proof point: garantía 2 años. Google: "zapatos para trabajar de pie sin dolor", "calzado formal cómodo hombre Colombia".'
          value={state.customerVoice}
          onChange={(e) => update("customerVoice", e.target.value)}
          helperText="8 frases textuales entre comillas (sin editar — usa palabras exactas de reviews, DMs, conversaciones). Principales objeciones + contraargumento + proof point. Búsquedas en Google cuando tienen el problema."
          rows={10}
        />
        <ErrorBox error={error} />
        <StepFooter
          onBack={onBack}
          saving={saving}
          primaryLabel="Terminar"
        />
      </FormShell>
    </>
  );
}
