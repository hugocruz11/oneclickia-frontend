"use client";

import { Icon } from "@/components/ui/Icon";
import { useI18n } from "@/contexts/I18nContext";
import {
  displayName,
  formatDay,
  isAtRisk,
  isOverdue,
  isWaiting,
  type TaskCard,
} from "@/lib/projects";
import { PRIORITY_CLASS, PRIORITY_LABEL } from "./labels";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Tarjeta compacta para Kanban y listas. Señales: bloqueada, en espera
// (dependencias), en riesgo (fecha estimada > límite) y atrasada.
export function TaskCardView({
  task,
  showProject = false,
  onOpen,
}: {
  task: TaskCard;
  showProject?: boolean;
  onOpen?: () => void;
}) {
  const { t, localeTag } = useI18n();
  const overdue = isOverdue(task);
  const atRisk = isAtRisk(task);
  const waiting = isWaiting(task);
  const assignee = task.assignee ? displayName(task.assignee) : null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-md border border-sand bg-white p-3 text-left shadow-sm transition-colors hover:border-charcoal/40"
    >
      {showProject && task.project && (
        <p className="mb-1 truncate text-[11px] font-semibold uppercase tracking-wide text-muted">
          {task.project.title}
        </p>
      )}
      <p className="text-sm font-medium leading-snug text-ink">{task.title}</p>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className={`font-semibold ${PRIORITY_CLASS[task.priority]}`}>
          {t(PRIORITY_LABEL[task.priority])}
        </span>
        {task.blocked && (
          <span className="inline-flex items-center gap-0.5 rounded-sm bg-red-100 px-1.5 py-0.5 font-semibold text-red-700">
            <Icon name="lock" size={11} /> {t("Bloqueada")}
          </span>
        )}
        {waiting && !task.blocked && (
          <span className="rounded-sm bg-sand-light px-1.5 py-0.5 font-semibold text-charcoal">
            {t("En espera")}
          </span>
        )}
        {overdue && (
          <span className="rounded-sm bg-red-100 px-1.5 py-0.5 font-semibold text-red-700">
            {t("Atrasada")}
          </span>
        )}
        {atRisk && !overdue && (
          <span className="rounded-sm bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-800">
            {t("En riesgo")}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted">
        <span className="flex items-center gap-1" title={t("Fecha estimada / límite")}>
          <Icon name="calendar" size={12} />
          {formatDay(task.estimatedEndProbable, localeTag)}
          {task.dueDate && <> / {formatDay(task.dueDate, localeTag)}</>}
        </span>
        <span className="flex items-center gap-2">
          {task._count.comments > 0 && (
            <span className="flex items-center gap-0.5">
              <Icon name="message" size={12} /> {task._count.comments}
            </span>
          )}
          {task._count.attachments > 0 && (
            <span className="flex items-center gap-0.5">
              <Icon name="paperclip" size={12} /> {task._count.attachments}
            </span>
          )}
          {assignee ? (
            <span
              title={assignee}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-cream"
            >
              {initials(assignee)}
            </span>
          ) : (
            <span className="rounded-sm border border-dashed border-sand px-1.5 py-0.5">
              {t("Sin asignar")}
            </span>
          )}
        </span>
      </div>
    </button>
  );
}
