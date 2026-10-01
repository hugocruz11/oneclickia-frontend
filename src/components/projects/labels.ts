import type { TranslateFn } from "@/i18n/translate";
import type {
  AppNotification,
  Confidence,
  OrgRole,
  ProjectStatus,
  SkillLevel,
  TaskPriority,
  TaskStatus,
} from "@/lib/projects";

// Las claves son el texto en español (ver src/i18n): se pasan por t().

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "Por hacer",
  IN_PROGRESS: "En progreso",
  IN_REVIEW: "En revisión",
  DONE: "Hecho",
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  INTAKE: "Preguntas iniciales",
  PLANNING: "Generando plan",
  DRAFT: "Borrador",
  ACTIVE: "Activo",
  COMPLETED: "Completado",
  ARCHIVED: "Archivado",
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};

export const PRIORITY_CLASS: Record<TaskPriority, string> = {
  LOW: "text-muted",
  MEDIUM: "text-charcoal",
  HIGH: "text-amber-600",
  CRITICAL: "text-red-600",
};

export const ROLE_LABEL: Record<OrgRole, string> = {
  ADMIN: "Admin",
  LEADER: "Líder",
  MEMBER: "Miembro",
};

export const LEVEL_LABEL: Record<SkillLevel, string> = {
  JUNIOR: "Junior",
  MID: "Mid",
  SENIOR: "Senior",
};

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  LOW: "Confianza baja",
  MEDIUM: "Confianza media",
  HIGH: "Confianza alta",
};

/** Mensajes por código de error estable del backend. */
export const ERROR_CODE_LABEL: Record<string, string> = {
  DEPENDENCY_CYCLE: "Esa dependencia crearía un ciclo entre tareas.",
  DEPENDENCY_CROSS_PROJECT: "Solo se pueden relacionar tareas del mismo proyecto.",
  INVALID_TRANSITION: "Ese cambio de estado no está permitido.",
  COMMENT_REQUIRED: "Debes explicar por qué se rechaza.",
  REASON_REQUIRED: "Indica el motivo del bloqueo.",
  ACTUAL_HOURS_REQUIRED: "Indica cuántas horas te tomó la tarea.",
  LAST_ADMIN: "La organización debe tener al menos un administrador.",
  ALREADY_MEMBER: "Esta persona ya es miembro de la organización.",
  INVITATION_EXPIRED: "La invitación expiró o ya fue usada.",
  INVITATION_EMAIL_MISMATCH: "Esta invitación es para otro email.",
  GENERATION_IN_PROGRESS: "Ya se está generando un plan para este proyecto.",
  FORBIDDEN_ROLE: "No tienes permiso para esta acción.",
  NOT_FOUND: "No encontrado.",
  INVALID_PROJECT_STATE: "El proyecto no permite esta acción en su estado actual.",
};

export function errorMessage(err: unknown, t: TranslateFn, fallback = "Ocurrió un error."): string {
  if (err && typeof err === "object" && "code" in err) {
    const code = (err as { code?: string }).code;
    if (code && ERROR_CODE_LABEL[code]) return t(ERROR_CODE_LABEL[code]);
  }
  if (err instanceof Error && err.message) return err.message;
  return t(fallback);
}

/** Texto de una notificación a partir de su tipo + parámetros. */
export function notificationText(n: AppNotification, t: TranslateFn): string {
  const p = n.params;
  const task = String(p.taskTitle ?? n.task?.title ?? "");
  const project = String(p.projectTitle ?? n.project?.title ?? "");
  const count = Number(p.count ?? n.count ?? 1);
  switch (n.type) {
    case "TASK_ASSIGNED":
      return count > 1
        ? t("Te asignaron {count} tareas en {project}", { count, project })
        : t("Te asignaron una tarea en {project}", { project });
    case "TASK_DUE_SOON":
      return n.count > 1
        ? t("{count} tareas vencen pronto en {project}", { count: n.count, project })
        : t("“{task}” vence pronto", { task });
    case "TASK_OVERDUE":
      return n.count > 1
        ? t("{count} tareas retrasadas en {project}", { count: n.count, project })
        : t("“{task}” está retrasada", { task });
    case "TASK_REJECTED":
      return t("Rechazaron el entregable de “{task}”", { task });
    case "DEPENDENCY_DONE":
      return t("Ya puedes empezar “{task}”", { task });
    case "MENTION":
      return t("{author} te mencionó en “{task}”", { author: String(p.authorName ?? ""), task });
    case "TASK_BLOCKED":
      return t("“{task}” está bloqueada: {reason}", { task, reason: String(p.reason ?? "") });
    case "REVIEW_REQUESTED":
      return t("“{task}” está lista para revisión", { task });
    case "CAPACITY_CONFLICT":
      return t("Conflicto de capacidad en {project}", { project });
    case "TASK_UNASSIGNED":
      return t("{count} tareas sin asignar en {project}", { count, project });
    case "PROJECT_DATE_CHANGED":
      return t("La fecha estimada de {project} cambió a {to}", { project, to: String(p.to ?? "") });
    case "TASK_AT_RISK":
      return n.count > 1
        ? t("{count} tareas en riesgo en {project}", { count: n.count, project })
        : t("“{task}” no llegaría a su fecha límite", { task });
    case "PLAN_READY":
      return t("El plan de {project} está listo para revisar", { project });
    case "PLAN_FAILED":
      return t("No se pudo generar el plan de {project}. No se cobraron créditos.", { project });
    case "DAILY_DIGEST":
      return t(
        "Resumen de {project}: {completed} completadas, {overdue} atrasadas, avance {progress}%",
        {
          project,
          completed: Number(p.completed ?? 0),
          overdue: Number(p.overdue ?? 0),
          progress: Number(p.progress ?? 0),
        },
      );
    case "MEMBER_DEACTIVATED":
      return t("{member} fue desactivado: {count} tareas quedaron sin asignar en {project}", {
        member: String(p.memberName ?? ""),
        count,
        project,
      });
    default:
      return n.type;
  }
}

/** Enlace de destino de una notificación. */
export function notificationHref(n: AppNotification): string {
  if (n.projectId && n.taskId) return `/projects/${n.projectId}?task=${n.taskId}`;
  if (n.projectId) return `/projects/${n.projectId}`;
  return "/my-tasks";
}
