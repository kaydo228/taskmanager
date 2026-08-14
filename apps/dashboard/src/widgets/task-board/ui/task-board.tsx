import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import { TaskColumn } from './task-column';
import { TaskCard } from '@/entities/task/ui/task-card';
import type { Task, TaskStatus } from '@/entities/task';

const columns: Array<{ status: TaskStatus; title: string }> = [
  { status: 'todo', title: 'Нужно сделать' },
  { status: 'in-progress', title: 'В работе' },
  { status: 'done', title: 'Готово' },
];

type TaskBoardProps = {
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onMove: (
    taskId: string,
    status: TaskStatus,
    overTaskId?: string,
    insertAfter?: boolean,
  ) => void;
  tasks: Task[];
};

export function TaskBoard({ onDelete, onEdit, onMove, tasks }: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over) return;
    const overTask = tasks.find((task) => task.id === String(over.id));
    const targetStatus =
      overTask?.status ??
      columns.find((column) => column.status === over.id)?.status;

    if (!targetStatus) return;

    const activeRect = active.rect.current.translated;
    const activeCenter = activeRect
      ? activeRect.top + activeRect.height / 2
      : 0;
    const insertAfter =
      Boolean(overTask) && activeCenter > over.rect.top + over.rect.height / 2;

    onMove(String(active.id), targetStatus, overTask?.id, insertAfter);
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragCancel={() => setActiveTask(null)}
      onDragEnd={(event) => {
        handleDragEnd(event);
        setActiveTask(null);
      }}
      onDragStart={({ active }) =>
        setActiveTask(
          tasks.find((task) => task.id === String(active.id)) ?? null,
        )
      }
      sensors={sensors}
    >
      <div className="task-board">
        {columns.map(({ status, title }) => {
          const columnTasks = tasks.filter((task) => task.status === status);
          return (
            <SortableContext
              items={columnTasks.map((task) => task.id)}
              key={status}
              strategy={verticalListSortingStrategy}
            >
              <TaskColumn
                count={columnTasks.length}
                status={status}
                title={title}
              >
                {columnTasks.map((task) => (
                  <TaskCard
                    dragging={activeTask?.id === task.id}
                    key={task.id}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onMove={onMove}
                    task={task}
                  />
                ))}
              </TaskColumn>
            </SortableContext>
          );
        })}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="task-card task-card--overlay">
            <strong>{activeTask.title}</strong>
            <span>{activeTask.priority}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
