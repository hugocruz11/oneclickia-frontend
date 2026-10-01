"use client";

import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useT } from "@/contexts/I18nContext";
import { TASK_STATUSES, type TaskCard, type TaskStatus } from "@/lib/projects";
import { TASK_STATUS_LABEL } from "./labels";
import { TaskCardView } from "./TaskCardView";

function DraggableCard({
  task,
  disabled,
  showProject,
  onOpen,
}: {
  task: TaskCard;
  disabled: boolean;
  showProject: boolean;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled,
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${isDragging ? "relative z-20 opacity-80" : ""} ${disabled ? "" : "cursor-grab"}`}
    >
      <TaskCardView task={task} showProject={showProject} onOpen={onOpen} />
    </div>
  );
}

function Column({
  status,
  tasks,
  children,
}: {
  status: TaskStatus;
  tasks: TaskCard[];
  children: React.ReactNode;
}) {
  const t = useT();
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[200px] w-72 shrink-0 flex-col gap-2 rounded-md border p-2 transition-colors sm:w-auto sm:flex-1 ${
        isOver ? "border-orange bg-orange/5" : "border-sand bg-sand-light/50"
      }`}
    >
      <div className="flex items-center justify-between px-1 pb-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-charcoal">
          {t(TASK_STATUS_LABEL[status])}
        </span>
        <span className="text-xs text-muted">{tasks.length}</span>
      </div>
      {children}
    </div>
  );
}

// Kanban por estado. Arrastrar dispara `onMove`; las reglas del flujo y los
// datos obligatorios (comentario, horas) los resuelve quien lo usa.
export function KanbanBoard({
  tasks,
  canDrag,
  onMove,
  onOpen,
  showProject = false,
}: {
  tasks: TaskCard[];
  canDrag: (task: TaskCard) => boolean;
  onMove: (task: TaskCard, to: TaskStatus) => void;
  onOpen: (task: TaskCard) => void;
  showProject?: boolean;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  function onDragEnd(e: DragEndEvent) {
    const to = e.over?.id as TaskStatus | undefined;
    const task = tasks.find((x) => x.id === e.active.id);
    if (task && to && to !== task.status) onMove(task, to);
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {TASK_STATUSES.map((status) => {
          const list = tasks.filter((x) => x.status === status);
          return (
            <Column key={status} status={status} tasks={list}>
              {list.map((task) => (
                <DraggableCard
                  key={task.id}
                  task={task}
                  disabled={!canDrag(task)}
                  showProject={showProject}
                  onOpen={() => onOpen(task)}
                />
              ))}
            </Column>
          );
        })}
      </div>
    </DndContext>
  );
}
