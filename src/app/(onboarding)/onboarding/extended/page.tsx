"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { Textarea } from "@/components/ui/Textarea";
import { Spinner } from "@/components/ui/Spinner";
import { api, ApiError } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────

interface Brand {
  id: string;
  name: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
}

interface Intelligence {
  productDescription: string | null;
  audience: string | null;
  notProduct: string | null;
  usp: string | null;
  counterNarrative: string | null;
  emotionalBenefit: string | null;
  identityBenefit: string | null;
  jobToBeDone: string | null;
  purchaseTrigger: string | null;
  voiceOfCustomer: string | null;
  competitiveLandscape: string | null;
  marketGap: string | null;
  statsForAds: string | null;
  socialProof: string | null;
  testimonials: string | null;
  objections: string | null;
  emotionalTriggers: string | null;
  completedSteps: number[];
  isComplete: boolean;
}

type IntelligenceField = Exclude<
  keyof Intelligence,
  "completedSteps" | "isComplete"
>;

// ─── Step definitions ─────────────────────────────────────────────

interface FieldDef {
  key: IntelligenceField;
  label: string;
  placeholder: string;
  helperText: string;
  rows?: number;
}

interface StepDef {
  num: number;
  title: string;
  subtitle: string;
  fields: FieldDef[];
}

const STEPS: StepDef[] = [
  {
    num: 1,
    title: "Tu producto",
    subtitle:
      "Define qué vendes, a quién, y qué NO eres. El anti-posicionamiento es el copy más diferenciador.",
    fields: [
      {
        key: "productDescription",
        label: "¿Qué es tu producto?",
        placeholder:
          "Ej: Jeans de tiro alto para mujeres altas, corte recto, denim elástico 98% algodón / 2% lycra.",
        helperText: "Describe qué tipo de objeto o servicio es, su categoría y su propósito central.",
        rows: 3,
      },
      {
        key: "audience",
        label: "¿Para quién es?",
        placeholder:
          "Ej: Primario: mujeres 28-40 que trabajan y buscan ropa cómoda. Secundario: madres que compran para sus hijas.",
        helperText: "Avatar primario + secundario. El primario determina el 80% del enfoque creativo.",
        rows: 3,
      },
      {
        key: "notProduct",
        label: "¿Qué NO es tu producto?",
        placeholder:
          "Ej: No es una silla gamer. No cura el dolor de espalda. Es soporte postural para trabajo de escritorio.",
        helperText: "¿Con qué lo confunden? ¿Qué promesas NO hace tu marca? Esto define el anti-posicionamiento.",
        rows: 3,
      },
    ],
  },
  {
    num: 2,
    title: "Diferenciación",
    subtitle:
      "Tu USP es el eje de toda la estrategia creativa. Una USP borrosa genera ads genéricos.",
    fields: [
      {
        key: "usp",
        label: "USP — Propuesta de valor única",
        placeholder:
          "Ej: 'Hablas desde el día 1, no después de 6 meses.' — Filosófica: aprender es conversar. Funcional: 15 min/día con IA. Emocional: dejar de sentir vergüenza.",
        helperText: "En una oración + 3 capas (filosófica, funcional, emocional).",
        rows: 4,
      },
      {
        key: "counterNarrative",
        label: "¿Contra qué narrativa te posicionas?",
        placeholder:
          "Ej: Todos venden velocidad y especificaciones. Nosotros vendemos que dejes de perder tiempo buscando archivos.",
        helperText: "¿Qué hace tu USP diferente al discurso dominante de tu categoría?",
        rows: 3,
      },
    ],
  },
  {
    num: 3,
    title: "Beneficios emocionales",
    subtitle:
      "El 80% del copy que convierte vive aquí, no en las especificaciones técnicas.",
    fields: [
      {
        key: "emotionalBenefit",
        label: "Beneficio emocional inmediato",
        placeholder:
          "Ej: Ponerse algo y sentir que fue hecho para tu cuerpo, no que tu cuerpo tuvo que adaptarse a la talla.",
        helperText: "No describas el producto — describe la sensación al usarlo.",
        rows: 3,
      },
      {
        key: "identityBenefit",
        label: "Beneficio de identidad a largo plazo",
        placeholder:
          "Ej: Dejar de ser 'alguien que quiere aprender inglés' para ser 'alguien que habla inglés'.",
        helperText: "¿Cómo cambia la identidad del usuario después de usarlo por un mes? Esto genera recompra y recomendación.",
        rows: 3,
      },
    ],
  },
  {
    num: 4,
    title: "Tu cliente",
    subtitle:
      "Lo que el cliente realmente contrata cuando te compra, cuándo lo hace, y cómo habla de su problema.",
    fields: [
      {
        key: "jobToBeDone",
        label: "Job to Be Done",
        placeholder:
          "Ej: Funcional: no llegar a la reunión con la espalda sudada. Emocional: sentirse organizado. Social: que la mochila comunique gusto, no solo función.",
        helperText: "Trabajo funcional, emocional y social que contrata cuando te compra.",
        rows: 3,
      },
      {
        key: "purchaseTrigger",
        label: "Eventos que detonan la compra",
        placeholder:
          "Ej: 1) Le duele la espalda después de 6h. 2) Ve a un colega con una silla nueva. 3) El médico le dice que su postura es el problema. 4) Se muda.",
        helperText: "Los 3-4 momentos más comunes. El trigger define cuándo pautar.",
        rows: 3,
      },
      {
        key: "voiceOfCustomer",
        label: "Voice of Customer — frases textuales del cliente",
        placeholder:
          "Ej: 'Entro a cualquier tienda y nada me queda', 'me canso de probarme ropa que no fue hecha para mí', 'compro online y siempre devuelvo'.",
        helperText: "8-12 frases reales entre comillas. El copy más poderoso no se inventa — se transcribe.",
        rows: 6,
      },
    ],
  },
  {
    num: 5,
    title: "Mercado y competencia",
    subtitle:
      "Sin mapa competitivo no hay diferenciación real — solo más ruido en un mercado donde todos dicen lo mismo.",
    fields: [
      {
        key: "competitiveLandscape",
        label: "Competidores y cómo se comunican",
        placeholder:
          "Ej: Directo: Totto — amplia distribución, precio medio, diseño genérico. Directo: Osprey — premium importado. Todos hablan en tono técnico-masculino de poder.",
        helperText: "Tus 3-5 competidores principales, sus precios, fortalezas, debilidades y el tono que dominan en la categoría.",
        rows: 5,
      },
      {
        key: "marketGap",
        label: "Hueco que nadie está ocupando",
        placeholder:
          "Ej: Yo soy el único compatible con todos los asistentes de voz. Ese hueco nadie lo comunica en pauta.",
        helperText: "El hueco del mercado es el ángulo más rentable — sin competencia directa.",
        rows: 3,
      },
    ],
  },
  {
    num: 6,
    title: "Munición creativa",
    subtitle:
      "Datos, social proof y testimonios que la IA puede usar directamente en hooks y body copy.",
    fields: [
      {
        key: "statsForAds",
        label: "Datos / estadísticas usables en el hook",
        placeholder:
          "Ej: El 73% de los colombianos pasa más de 6h diarias en mala postura. El trabajo remoto creció 340% desde 2020.",
        helperText: "Un dato específico en el hook aumenta el CTR hasta un 40%.",
        rows: 3,
      },
      {
        key: "socialProof",
        label: "Social proof disponible",
        placeholder:
          "Ej: 3.200 unidades vendidas en 6 meses. Rating 4.9/5 en Google (312 reseñas). Mencionado en Semana y La Bicicleta.",
        helperText: "Número de clientes, unidades vendidas, reviews, menciones en medios, endorsements.",
        rows: 3,
      },
      {
        key: "testimonials",
        label: "Testimonios modelo",
        placeholder:
          "Ej: 'Llevo 3 meses usándolos para trabajar de pie y ya no llego a casa con los pies destrozados.' — María, Bogotá.",
        helperText: "3 testimonios con resultado + timeline + emoción. Pega los reales si los tienes.",
        rows: 5,
      },
    ],
  },
  {
    num: 7,
    title: "Objeciones y triggers",
    subtitle:
      "Cada objeción no resuelta en el copy es una venta perdida. Resolverlas antes de que el cliente las formule las convierte en argumento de compra.",
    fields: [
      {
        key: "objections",
        label: "Top objeciones (precio, confianza, producto)",
        placeholder:
          "Ej: 'Hay más baratos en Mercado Libre' → los de $200K duran 1 año, este 10. 'No conozco la marca' → 5.000 clientes, 4.8/5 Google. '¿Y si no me queda?' → cambio gratis en 30 días.",
        helperText: "Las 3-5 objeciones más comunes y cómo se contrarrestan con un proof point.",
        rows: 5,
      },
      {
        key: "emotionalTriggers",
        label: "Top triggers emocionales de tu categoría",
        placeholder:
          "Ej: Caos → alivio: 'El domingo mirando el desastre de la semana — ese momento termina.' Vergüenza → orgullo: 'Que lleguen visitas sin pánico.'",
        helperText: "3 triggers con la emoción que activan y un hook de ejemplo.",
        rows: 4,
      },
    ],
  },
];

const TOTAL_STEPS = STEPS.length;

// ─── Page ─────────────────────────────────────────────────────────

export default function ExtendedOnboardingPage() {
  const router = useRouter();
  const [bootstrapped, setBootstrapped] = useState(false);
  const [hasBrand, setHasBrand] = useState(false);
  const [intelligence, setIntelligence] = useState<Partial<Intelligence>>({});
  const [step, setStep] = useState(0); // 0 = basics screen, 1..7 = wizard steps
  const [error, setError] = useState("");

  useEffect(() => {
    async function bootstrap() {
      try {
        const { brand } = await api.get<{ brand: Brand | null }>("/brand");
        if (brand?.name && brand.websiteUrl && brand.logoUrl) {
          setHasBrand(true);
        }
      } catch {
        // Brand may not exist yet — that's fine.
      }
      try {
        const { intelligence: existing } = await api.get<{
          intelligence: Intelligence | null;
        }>("/brand/intelligence");
        if (existing) {
          setIntelligence(existing);
          // Resume at the first incomplete step (or 1 if none completed)
          const done = new Set(existing.completedSteps ?? []);
          const next = [1, 2, 3, 4, 5, 6, 7].find((s) => !done.has(s)) ?? 1;
          setStep(next);
        }
      } catch {
        // No intelligence yet — start at step 0 or 1
      }
      setBootstrapped(true);
    }
    bootstrap();
  }, []);

  // After bootstrap, decide entry point if not yet set.
  // If the user already has a brand (e.g., did the quick onboarding
  // before), skip step 0 (basics) and jump straight into the wizard.
  useEffect(() => {
    if (!bootstrapped) return;
    if (step === 0 && hasBrand) {
      setStep(1);
    }
  }, [bootstrapped, hasBrand, step]);

  if (!bootstrapped) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (step === 0 && !hasBrand) {
    return (
      <BasicsStep
        onSaved={() => {
          setHasBrand(true);
          setStep(1);
        }}
      />
    );
  }

  const currentStep = STEPS[step - 1];
  if (!currentStep) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress bar */}
      <ProgressBar current={step} total={TOTAL_STEPS} />

      <Card padding="lg">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Paso {step} de {TOTAL_STEPS}
          </span>
          <Link
            href="/onboarding"
            className="text-xs text-muted hover:text-orange"
          >
            Salir
          </Link>
        </div>
        <h2 className="mt-2 text-xl font-semibold text-ink">
          {currentStep.title}
        </h2>
        <p className="mt-2 text-sm text-muted">{currentStep.subtitle}</p>

        <StepForm
          step={currentStep}
          values={intelligence}
          onValueChange={(key, value) =>
            setIntelligence((prev) => ({ ...prev, [key]: value }))
          }
          onSaved={async () => {
            setError("");
            try {
              const payload: Record<string, unknown> = {
                completedSteps: [step],
              };
              for (const f of currentStep.fields) {
                const v = intelligence[f.key];
                if (typeof v === "string") payload[f.key] = v;
              }
              if (step === TOTAL_STEPS) {
                payload.isComplete = true;
              }
              const { intelligence: updated } = await api.patch<{
                intelligence: Intelligence;
              }>("/brand/intelligence", payload);
              setIntelligence(updated);

              if (step === TOTAL_STEPS) {
                router.replace("/brand?from=onboarding");
              } else {
                setStep(step + 1);
              }
            } catch (err) {
              setError(
                err instanceof ApiError
                  ? err.message
                  : "No se pudo guardar.",
              );
            }
          }}
          onBack={step > 1 ? () => setStep(step - 1) : undefined}
          isLast={step === TOTAL_STEPS}
          error={error}
        />
      </Card>
    </div>
  );
}

// ─── Step 0: basics (if brand doesn't exist) ──────────────────────

function BasicsStep({ onSaved }: { onSaved: () => void }) {
  const [name, setName] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !logo || !websiteUrl.trim()) {
      setError("Nombre, logo y URL del sitio web son obligatorios.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("logo", logo);
      formData.append("websiteUrl", websiteUrl.trim());
      if (instagramUrl.trim()) {
        formData.append("instagramUrl", instagramUrl.trim());
      }
      await api.post("/onboarding", formData);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ProgressBar current={0} total={TOTAL_STEPS} />
      <Card padding="lg">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Datos básicos
          </span>
          <Link
            href="/onboarding"
            className="text-xs text-muted hover:text-orange"
          >
            Salir
          </Link>
        </div>
        <h2 className="mt-2 text-xl font-semibold text-ink">
          Lo esencial primero
        </h2>
        <p className="mt-2 text-sm text-muted">
          Necesitamos nombre, logo y sitio web antes de empezar con el
          análisis profundo de marca.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <Input
            label="Nombre de la marca *"
            placeholder="Ej: Mi Tienda Online"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <FileUpload
            label="Logo de la marca *"
            value={logo}
            onChange={setLogo}
            helperText="Se usará en tus anuncios generados."
          />
          <Input
            label="URL del sitio web *"
            type="url"
            placeholder="https://www.tumarca.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            required
          />
          <Input
            label="URL de Instagram (opcional)"
            type="url"
            placeholder="https://instagram.com/tumarca"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
          />

          {error && (
            <div className="rounded-md border border-error/20 bg-error/10 p-3">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <Button type="submit" loading={loading} size="lg" className="w-full">
            Continuar al análisis profundo →
          </Button>
        </form>
      </Card>
    </div>
  );
}

// ─── Step form ────────────────────────────────────────────────────

function StepForm({
  step,
  values,
  onValueChange,
  onSaved,
  onBack,
  isLast,
  error,
}: {
  step: StepDef;
  values: Partial<Intelligence>;
  onValueChange: (key: IntelligenceField, value: string) => void;
  onSaved: () => Promise<void>;
  onBack?: () => void;
  isLast: boolean;
  error: string;
}) {
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  function isFieldFilled(key: IntelligenceField): boolean {
    const v = values[key];
    return typeof v === "string" && v.trim().length > 0;
  }

  const missingFields = step.fields.filter((f) => !isFieldFilled(f.key));
  const allFilled = missingFields.length === 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!allFilled) {
      setShowErrors(true);
      return;
    }
    setSaving(true);
    await onSaved();
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5" noValidate>
      {step.fields.map((f) => {
        const missing = showErrors && !isFieldFilled(f.key);
        return (
          <Textarea
            key={f.key}
            label={`${f.label} *`}
            placeholder={f.placeholder}
            helperText={f.helperText}
            value={(values[f.key] as string | null) ?? ""}
            onChange={(e) => {
              onValueChange(f.key, e.target.value);
              if (showErrors) setShowErrors(false);
            }}
            rows={f.rows ?? 4}
            error={missing ? "Este campo es obligatorio." : undefined}
          />
        );
      })}

      {showErrors && !allFilled && (
        <div className="rounded-md border border-error/20 bg-error/10 p-3">
          <p className="text-sm text-error">
            Completa todos los campos para continuar. Si prefieres una
            configuración más corta,{" "}
            <Link
              href="/onboarding"
              className="font-semibold underline hover:text-error/80"
            >
              vuelve y elige la rápida
            </Link>
            .
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-error/20 bg-error/10 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sand pt-5">
        {onBack ? (
          <Button type="button" variant="ghost" size="sm" onClick={onBack}>
            ← Atrás
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" size="md" loading={saving}>
          {isLast ? "Terminar" : "Guardar y continuar →"}
        </Button>
      </div>
    </form>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = (current / total) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand">
        <div
          className="h-full bg-orange transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-muted">
        {current} / {total}
      </span>
    </div>
  );
}
