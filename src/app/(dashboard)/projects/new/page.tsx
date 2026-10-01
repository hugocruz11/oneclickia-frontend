"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Icon } from "@/components/ui/Icon";
import { useI18n } from "@/contexts/I18nContext";
import { useCredits } from "@/contexts/CreditsContext";
import { canLead, useOrg } from "@/contexts/OrgContext";
import { projectsApi, type IntakeQuestion } from "@/lib/projects";
import { errorMessage } from "@/components/projects/labels";

const input =
  "w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-orange focus:outline-none";

type Step = "objective" | "intake" | "generating" | "failed";

const POLL_MS = 2500;

// Asistente: objetivo → preguntas de intake → plan en borrador (async).
export default function NewProjectPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { role, isLoading } = useOrg();
  const { refresh: refreshCredits } = useCredits();
  const [step, setStep] = useState<Step>("objective");
  const [objective, setObjective] = useState("");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<IntakeQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (pollRef.current) clearTimeout(pollRef.current);
  }, []);

  if (!isLoading && !canLead(role)) {
    return (
      <Card className="mx-auto max-w-xl text-center text-sm text-muted">
        {t("Solo líderes y administradores pueden crear proyectos.")}
      </Card>
    );
  }

  async function startProject(manual: boolean) {
    setError("");
    setBusy(true);
    try {
      const project = await projectsApi.create({
        objective: objective.trim(),
        title: title.trim() || undefined,
        dueDate: dueDate || undefined,
        manual,
      });
      if (manual) {
        router.push(`/projects/${project.id}`);
        return;
      }
      setProjectId(project.id);
      const qs = await projectsApi.intake(project.id);
      refreshCredits();
      setQuestions(qs);
      setStep("intake");
    } catch (err) {
      setError(errorMessage(err, t));
    } finally {
      setBusy(false);
    }
  }

  function poll(generationId: string, id: string) {
    pollRef.current = setTimeout(async () => {
      try {
        const gen = await projectsApi.generation(generationId);
        if (gen.status === "SUCCEEDED") {
          router.push(`/projects/${id}`);
          return;
        }
        if (gen.status === "FAILED") {
          setStep("failed");
          refreshCredits();
          return;
        }
      } catch {
        // reintenta en el siguiente ciclo
      }
      poll(generationId, id);
    }, POLL_MS);
  }

  async function generatePlan() {
    if (!projectId) return;
    setError("");
    setBusy(true);
    try {
      const gen = await projectsApi.plan(
        projectId,
        questions.map((q) => ({ questionId: q.id, answer: answers[q.id] ?? "" })),
      );
      refreshCredits();
      setStep("generating");
      poll(gen.id, projectId);
    } catch (err) {
      setError(errorMessage(err, t));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{t("Nuevo proyecto")}</h1>
        <p className="text-sm text-muted">
          {t("Funciona para cualquier tipo de proyecto: producto, marca, software, evento, operaciones…")}
        </p>
      </div>

      {error && <p className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">{error}</p>}

      {step === "objective" && (
        <Card className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal">
            {t("¿Qué quieres lograr?")}
            <textarea
              className={input}
              rows={5}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder={t("Ej: Quiero lanzar una nueva marca de café en 8 semanas, con identidad visual, empaque y plan de lanzamiento.")}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal">
              {t("Nombre (opcional)")}
              <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal">
              {t("Fecha límite (opcional)")}
              <input className={input} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </label>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              variant="ghost"
              disabled={objective.trim().length < 10 || busy}
              onClick={() => startProject(true)}
            >
              {t("Crear sin IA")}
            </Button>
            <Button disabled={objective.trim().length < 10} loading={busy} onClick={() => startProject(false)}>
              <Icon name="sparkles" size={16} className="mr-1.5" />
              {t("Continuar")}
            </Button>
          </div>
        </Card>
      )}

      {step === "intake" && (
        <Card className="flex flex-col gap-4">
          <p className="text-sm text-charcoal">
            {t("Antes de planear, responde estas preguntas. Mientras más contexto, mejor el plan.")}
          </p>
          {questions.map((q) => (
            <label key={q.id} className="flex flex-col gap-1.5 text-sm font-medium text-charcoal">
              {q.question}
              {q.kind === "choice" && q.options ? (
                <select
                  className={input}
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                >
                  <option value="">{t("Selecciona…")}</option>
                  {q.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : q.kind === "date" ? (
                <input
                  type="date"
                  className={input}
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                />
              ) : (
                <textarea
                  rows={2}
                  className={input}
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                />
              )}
            </label>
          ))}
          <div className="flex justify-end">
            <Button loading={busy} onClick={generatePlan}>
              <Icon name="sparkles" size={16} className="mr-1.5" />
              {t("Generar plan")}
            </Button>
          </div>
        </Card>
      )}

      {step === "generating" && (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <Spinner size="lg" />
          <p className="font-medium text-ink">{t("La IA está armando tu plan…")}</p>
          <p className="max-w-md text-sm text-muted">
            {t("Definiendo fases, tareas, skills, estimados y dependencias. Puede tardar hasta un minuto; también te avisaremos en la campanita.")}
          </p>
        </Card>
      )}

      {step === "failed" && (
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="font-medium text-ink">{t("No se pudo generar el plan.")}</p>
          <p className="text-sm text-muted">{t("No se cobraron créditos. Puedes intentarlo de nuevo.")}</p>
          <Button onClick={() => setStep("intake")}>{t("Reintentar")}</Button>
        </Card>
      )}
    </div>
  );
}
