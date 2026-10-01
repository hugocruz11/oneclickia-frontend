"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { useI18n } from "@/contexts/I18nContext";
import {
  displayName,
  formatDay,
  projectsApi,
  tasksApi,
  type ApprovalResult,
  type ProjectDetail,
} from "@/lib/projects";
import { errorMessage, PRIORITY_CLASS, PRIORITY_LABEL } from "./labels";
import { PromptDialog } from "./Modal";

const input =
  "w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-orange focus:outline-none";

// Editor del plan en borrador: el líder ajusta fases y tareas, regenera una
// fase con IA y aprueba (asignación automática + programación).
export function PlanEditor({
  project,
  onChanged,
  onOpenTask,
  onApproved,
}: {
  project: ProjectDetail;
  onChanged: () => void;
  onOpenTask: (taskId: string) => void;
  onApproved: (result: ApprovalResult) => void;
}) {
  const { t, localeTag } = useI18n();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [newPhase, setNewPhase] = useState("");
  const [quickTask, setQuickTask] = useState<Record<string, { title: string; hours: string }>>({});
  const [regenPhase, setRegenPhase] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const totalTasks = project.phases.reduce((s, p) => s + p.tasks.length, 0);
  const totalHours = project.phases.reduce(
    (s, p) => s + p.tasks.reduce((h, x) => h + Number(x.baseEstimateHours), 0),
    0,
  );

  async function run(fn: () => Promise<unknown>) {
    setError("");
    setBusy(true);
    try {
      await fn();
      onChanged();
    } catch (err) {
      setError(errorMessage(err, t));
    } finally {
      setBusy(false);
    }
  }

  async function approve() {
    setError("");
    setBusy(true);
    try {
      onApproved(await projectsApi.approve(project.id));
    } catch (err) {
      setError(errorMessage(err, t));
    } finally {
      setBusy(false);
    }
  }

  async function regenerate(phaseId: string, instructions: string) {
    setRegenPhase(null);
    setError("");
    setBusy(true);
    setRegenerating(phaseId);
    try {
      const gen = await projectsApi.regeneratePhase(phaseId, instructions || undefined);
      // La regeneración es asíncrona: espera a que termine (máx. ~3 min).
      for (let i = 0; i < 72; i++) {
        await new Promise((r) => setTimeout(r, 2500));
        const g = await projectsApi.generation(gen.id);
        if (g.status === "SUCCEEDED") break;
        if (g.status === "FAILED") {
          setError(t("No se pudo regenerar la fase. No se cobraron créditos."));
          break;
        }
      }
      onChanged();
    } catch (err) {
      setError(errorMessage(err, t));
    } finally {
      setBusy(false);
      setRegenerating(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink">{t("Plan en borrador")}</p>
          <p className="text-xs text-muted">
            {t("{phases} fases · {tasks} tareas · {hours} h estimadas. Revisa, ajusta y aprueba: al aprobar se asignan las tareas según skills y capacidad.", {
              phases: project.phases.length,
              tasks: totalTasks,
              hours: Math.round(totalHours),
            })}
          </p>
        </div>
        <Button loading={busy} disabled={totalTasks === 0} onClick={approve}>
          <Icon name="check" size={16} className="mr-1.5" />
          {t("Aprobar plan")}
        </Button>
      </Card>

      {project.summary && (
        <Card padding="sm">
          <p className="whitespace-pre-wrap text-sm text-charcoal">{project.summary}</p>
        </Card>
      )}

      {error && <p className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">{error}</p>}

      {project.phases.map((phase, idx) => (
        <Card key={phase.id} padding="sm" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs font-bold text-cream">
              {idx + 1}
            </span>
            {renaming === phase.id ? (
              <input
                autoFocus
                defaultValue={phase.name}
                className={`${input} max-w-sm`}
                onBlur={(e) => {
                  const name = e.target.value.trim();
                  setRenaming(null);
                  if (name && name !== phase.name) void run(() => projectsApi.updatePhase(phase.id, { name }));
                }}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              />
            ) : (
              <button type="button" className="text-base font-semibold text-ink hover:underline" onClick={() => setRenaming(phase.id)}>
                {phase.name}
              </button>
            )}
            <div className="ml-auto flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                loading={regenerating === phase.id}
                onClick={() => setRegenPhase(phase.id)}
              >
                <Icon name="refresh" size={14} className="mr-1" />
                {regenerating === phase.id ? t("Regenerando…") : t("Regenerar con IA")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                aria-label={t("Eliminar fase")}
                onClick={() => {
                  if (window.confirm(t("¿Eliminar la fase “{name}” y sus tareas?", { name: phase.name }))) {
                    void run(() => projectsApi.deletePhase(phase.id));
                  }
                }}
              >
                <Icon name="trash" size={14} />
              </Button>
            </div>
          </div>
          {phase.goal && <p className="text-xs text-muted">{phase.goal}</p>}

          <ul className="flex flex-col divide-y divide-sand rounded-md border border-sand bg-white">
            {phase.tasks.map((task) => (
              <li key={task.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                <button type="button" className="flex-1 text-left text-ink hover:underline" onClick={() => onOpenTask(task.id)}>
                  {task.title}
                </button>
                <span className="hidden flex-wrap gap-1 sm:flex">
                  {task.skills.slice(0, 3).map((s) => (
                    <span key={s.skillId} className="rounded-sm bg-sand-light px-1.5 py-0.5 text-[11px] text-charcoal">
                      {s.skill.name}
                    </span>
                  ))}
                </span>
                <span className={`text-xs font-semibold ${PRIORITY_CLASS[task.priority]}`}>
                  {t(PRIORITY_LABEL[task.priority])}
                </span>
                <span className="w-12 text-right text-xs text-muted">{Number(task.baseEstimateHours)} h</span>
                {task.assignee && <span className="hidden text-xs text-muted md:inline">{displayName(task.assignee)}</span>}
                {task.dueDate && <span className="hidden text-xs text-muted md:inline">{formatDay(task.dueDate, localeTag)}</span>}
                <button
                  type="button"
                  aria-label={t("Eliminar tarea")}
                  className="text-muted hover:text-error"
                  onClick={() => run(() => tasksApi.remove(task.id))}
                >
                  <Icon name="close" size={14} />
                </button>
              </li>
            ))}
            <li className="flex items-center gap-2 px-3 py-2">
              <input
                className={`${input} flex-1`}
                placeholder={t("Nueva tarea…")}
                value={quickTask[phase.id]?.title ?? ""}
                onChange={(e) =>
                  setQuickTask((q) => ({ ...q, [phase.id]: { title: e.target.value, hours: q[phase.id]?.hours ?? "4" } }))
                }
              />
              <input
                className={`${input} w-20`}
                type="number"
                min="0.5"
                step="0.5"
                aria-label={t("Horas")}
                value={quickTask[phase.id]?.hours ?? "4"}
                onChange={(e) =>
                  setQuickTask((q) => ({ ...q, [phase.id]: { title: q[phase.id]?.title ?? "", hours: e.target.value } }))
                }
              />
              <Button
                size="sm"
                variant="ghost"
                disabled={!quickTask[phase.id]?.title?.trim() || busy}
                onClick={() => {
                  const q = quickTask[phase.id];
                  void run(() =>
                    projectsApi.createTask(phase.id, {
                      title: q.title.trim(),
                      baseEstimateHours: Number(q.hours) || 4,
                    }),
                  ).then(() => setQuickTask((x) => ({ ...x, [phase.id]: { title: "", hours: "4" } })));
                }}
              >
                <Icon name="plus" size={14} />
              </Button>
            </li>
          </ul>
        </Card>
      ))}

      <Card padding="sm" className="flex gap-2">
        <input
          className={input}
          placeholder={t("Nombre de la nueva fase")}
          value={newPhase}
          onChange={(e) => setNewPhase(e.target.value)}
        />
        <Button
          variant="ghost"
          disabled={!newPhase.trim() || busy}
          onClick={() => run(() => projectsApi.createPhase(project.id, { name: newPhase.trim() })).then(() => setNewPhase(""))}
        >
          {t("Agregar fase")}
        </Button>
      </Card>

      {regenPhase && (
        <PromptDialog
          open
          title={t("Regenerar fase con IA")}
          field={{ kind: "text", label: t("¿Qué quieres cambiar? (opcional)") }}
          confirmLabel={t("Regenerar")}
          onCancel={() => setRegenPhase(null)}
          onConfirm={(v) => void regenerate(regenPhase, v)}
        />
      )}
    </div>
  );
}
