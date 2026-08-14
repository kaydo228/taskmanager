import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';
import type { TaskStatus } from '@/entities/task';

type TaskColumnProps = {
  children: ReactNode;
  count: number;
  status: TaskStatus;
  title: string;
};

export function TaskColumn({
  children,
  count,
  status,
  title,
}: TaskColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: status, data: { status } });

  return (
    <section
      aria-label={title}
      className={`task-column${isOver ? ' task-column--over' : ''}`}
      ref={setNodeRef}
    >
      <header>
        <h2>{title}</h2>
        <span>{count}</span>
      </header>
      <div className="task-column__body">{children}</div>
    </section>
  );
}
