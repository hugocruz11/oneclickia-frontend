"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { useI18n } from "@/contexts/I18nContext";
import { useOrg } from "@/contexts/OrgContext";
import {
  orgApi,
  tasksApi,
  type MemberProfile,
  type Skill,
  type TaskCard,
  type TaskStatus,
} from "@/lib/projects";
import { KanbanBoard } from "@/components/projects/KanbanBoard";
import { TaskListView } from "@/components/projects/TaskListView";
import { TaskDetailModal } from "@/components/projects/TaskDetailModal";
import { actionForMove, useTaskTransition } from "@/components/projects/useTaskTransition";
import { errorMessage } from "@/components/projects/labels";

const input =
  "rounded-md border border-sand bg-white px-2 py-1.5 text-sm text-ink focus:border-orange focus:outline-none";

// "Mis tareas": todas las tareas del usuario en todos sus proyectos.
export default function MyTasksPage() {
  const { t } = useI18n();
  const { current } = useOrg();
  const [tasks, setTasks] = useState<TaskCard[] | null>(null);
  const [view, setView] = useState<"list" | "board">("list");
  const [projectId, setProjectId] = useState("");
  const [dueBefore, setDueBefore] = useState("");
  const [includeDone, setIncludeDone] = useState(false);
  const [openTask, setOpenTask] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    tasksApi
      .mine({ includeDone: includeDone || view === "board" })
      .then(setTasks)
      .catch((err) => setError(errorMessage(err, t)));
  }, [includeDone, view, t]);

  useEffect(() => {
    if (!current) return;
    load();
  }, [current, load]);

  useEffect(() => {
    if (!current) return;
    orgApi.members().then(setMembers).catch(() => {});
    orgApi.skills().then(setSkills).catch(() => {});
  }, [current]);

  const transition = useTaskTransition(
    () => load(),
    (msg) => setError(msg),
  );

  const projects = useMemo(
    () => Array.from(new Map((tasks ?? []).filter((x) => x.project).map((x) => [x.project!.id, x.project!.title]))),
    [tasks],
  );
  const filtered = (tasks ?? []).filter(
    (x) =>
      (!projectId || x.projectId === projectId) &&
      (!dueBefore || (x.dueDate && x.dueDate.slice(0, 10) <= dueBefore)),
  );

  function onMove(task: TaskCard, to: TaskStatus) {
    const action = actionForMove(task.status, to);
    if (!action) {
      setError(t("Ese cambio de estado no está permitido."));
      return;
    }
    setError("");
    transition.request(task.id, action);
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="flex-1 text-2xl font-semibold text-ink">{t("Mis tareas")}</h1>
        <div className="flex rounded-md border border-sand">
          {(["list", "board"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm ${view === v ? "bg-sand-light font-semibold text-ink" : "text-muted"}`}
            >
              <Icon name={v === "list" ? "list" : "kanban"} size={16} />
              {v === "list" ? t("Lista") : t("Tablero")}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select className={input} value={projectId} onChange={(e) => setProjectId(e.target.value)} aria-label={t("Proyecto")}>
          <option value="">{t("Todos los proyectos")}</option>
          {projects.map(([id, title]) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-sm text-charcoal">
          {t("Vencen antes de")}
          <input type="date" className={input} value={dueBefore} onChange={(e) => setDueBefore(e.target.value)} />
        </label>
        {view === "list" && (
          <label className="flex items-center gap-1.5 text-sm text-charcoal">
            <input type="checkbox" checked={includeDone} onChange={(e) => setIncludeDone(e.target.checked)} />
            {t("Incluir terminadas")}
          </label>
        )}
      </div>

      {error && <p className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">{error}</p>}

      {tasks === null ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : view === "list" ? (
        <TaskListView tasks={filtered} showProject onOpen={(x) => setOpenTask(x.id)} />
      ) : (
        <KanbanBoard tasks={filtered} showProject canDrag={() => true} onMove={onMove} onOpen={(x) => setOpenTask(x.id)} />
      )}

      {openTask && (
        <TaskDetailModal
          taskId={openTask}
          onClose={() => setOpenTask(null)}
          onChanged={load}
          members={members}
          skills={skills}
          projectTasks={[]}
        />
      )}
      {transition.dialog}
    </div>
  );
}
