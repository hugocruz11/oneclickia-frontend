"use client";

import { useI18n } from "@/contexts/I18nContext";
import {
  displayName,
  formatDay,
  isAtRisk,
  isOverdue,
  type TaskCard,
} from "@/lib/projects";
import { PRIORITY_CLASS, PRIORITY_LABEL, TASK_STATUS_LABEL } from "./labels";

// Vista de lista (tabla) de tareas, con proyecto/fase opcionales.
export function TaskListView({
  tasks,
  onOpen,
  showProject = false,
}: {
  tasks: TaskCard[];
  onOpen: (task: TaskCard) => void;
  showProject?: boolean;
}) {
  const { t, localeTag } = useI18n();
  if (!tasks.length) {
    return <p className="py-8 text-center text-sm text-muted">{t("No hay tareas.")}</p>;
  }
  return (
    <div className="overflow-x-auto rounded-md border border-sand bg-white">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-sand-light text-left text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-3 py-2">{t("Tarea")}</th>
            {showProject && <th className="px-3 py-2">{t("Proyecto")}</th>}
            <th className="px-3 py-2">{t("Estado")}</th>
            <th className="px-3 py-2">{t("Prioridad")}</th>
            <th className="px-3 py-2">{t("Responsable")}</th>
            <th className="px-3 py-2">{t("Entrega estimada")}</th>
            <th className="px-3 py-2">{t("Límite")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand">
          {tasks.map((task) => {
            const overdue = isOverdue(task);
            const risk = isAtRisk(task);
            return (
              <tr key={task.id} className="cursor-pointer hover:bg-sand-light/60" onClick={() => onOpen(task)}>
                <td className="px-3 py-2 text-ink">
                  {task.title}
                  {task.blocked && <span className="ml-2 text-xs font-semibold text-red-600">{t("Bloqueada")}</span>}
                </td>
                {showProject && <td className="px-3 py-2 text-muted">{task.project?.title}</td>}
                <td className="px-3 py-2 text-charcoal">{t(TASK_STATUS_LABEL[task.status])}</td>
                <td className={`px-3 py-2 font-semibold ${PRIORITY_CLASS[task.priority]}`}>
                  {t(PRIORITY_LABEL[task.priority])}
                </td>
                <td className="px-3 py-2 text-charcoal">
                  {task.assignee ? displayName(task.assignee) : <span className="text-muted">{t("Sin asignar")}</span>}
                </td>
                <td className={`px-3 py-2 ${risk ? "font-semibold text-amber-700" : "text-charcoal"}`}>
                  {formatDay(task.estimatedEndProbable, localeTag)}
                </td>
                <td className={`px-3 py-2 ${overdue ? "font-semibold text-red-600" : "text-charcoal"}`}>
                  {formatDay(task.dueDate, localeTag)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
