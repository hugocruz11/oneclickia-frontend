"use client";

import { useState } from "react";
import { useT } from "@/contexts/I18nContext";
import {
  tasksApi,
  type TaskStatus,
  type TransitionAction,
  type TransitionResult,
} from "@/lib/projects";
import { PromptDialog, type PromptField } from "./Modal";
import { errorMessage } from "./labels";

/** Kanban move → workflow action (null = not allowed). */
export function actionForMove(from: TaskStatus, to: TaskStatus): TransitionAction | null {
  if (from === to) return null;
  if (from === "TODO" && to === "IN_PROGRESS") return "START";
  if (from === "IN_PROGRESS" && to === "IN_REVIEW") return "SUBMIT_REVIEW";
  if (from === "IN_REVIEW" && to === "DONE") return "APPROVE";
  if (from === "IN_REVIEW" && to === "IN_PROGRESS") return "REJECT";
  if (from === "IN_PROGRESS" && to === "TODO") return "RETURN_TODO";
  if (from === "DONE" && to === "IN_PROGRESS") return "REOPEN";
  return null;
}

const PROMPTS: Partial<Record<TransitionAction, { title: string; field: PromptField; confirm: string }>> = {
  REJECT: {
    title: "Rechazar entregable",
    field: { kind: "text", label: "¿Qué hay que corregir?", required: true },
    confirm: "Rechazar",
  },
  BLOCK: {
    title: "Marcar como bloqueada",
    field: { kind: "text", label: "Motivo del bloqueo", required: true },
    confirm: "Bloquear",
  },
  SUBMIT_REVIEW: {
    title: "Enviar a revisión",
    field: {
      kind: "number",
      label: "Horas reales dedicadas (déjalo vacío si usaste el temporizador)",
    },
    confirm: "Enviar",
  },
};

/**
 * Runs a task transition, asking first for the required data (rejection
 * comment, block reason, real hours). Returns a `dialog` element to render.
 */
export function useTaskTransition(
  onDone: (result: TransitionResult) => void,
  onError: (message: string) => void,
) {
  const t = useT();
  const [pending, setPending] = useState<{ taskId: string; action: TransitionAction } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  async function run(taskId: string, action: TransitionAction, value?: string) {
    setBusy(true);
    try {
      const extra =
        action === "REJECT"
          ? { comment: value }
          : action === "BLOCK"
            ? { reason: value }
            : action === "SUBMIT_REVIEW" && value
              ? { actualHours: Number(value) }
              : {};
      const result = await tasksApi.transition(taskId, action, extra);
      if (result.warnings.includes("WAITING_DEPENDENCIES")) {
        onError(t("Ojo: esta tarea tiene dependencias sin terminar."));
      }
      onDone(result);
    } catch (err) {
      onError(errorMessage(err, t));
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  function request(taskId: string, action: TransitionAction) {
    if (PROMPTS[action]) setPending({ taskId, action });
    else void run(taskId, action);
  }

  const prompt = pending ? PROMPTS[pending.action] : undefined;
  const dialog = prompt ? (
    <PromptDialog
      open
      title={t(prompt.title)}
      field={{ ...prompt.field, label: t(prompt.field.label) }}
      confirmLabel={t(prompt.confirm)}
      busy={busy}
      onCancel={() => setPending(null)}
      onConfirm={(value) => pending && void run(pending.taskId, pending.action, value)}
    />
  ) : null;

  return { request, dialog, busy };
}
