import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useRef, useState } from 'react';
import { Badge, Button, Dropdown } from '@taskflow/shared/ui';
import type { Task, TaskStatus } from '@/entities/task';
import { TaskDescription } from './task-description';

const statusOptions = [
  { label: 'Нужно сделать', value: 'todo' },
  { label: 'В работе', value: 'in-progress' },
  { label: 'Готово', value: 'done' },
] as const;

const priorityLabels: Record<Task['priority'], string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
};

type TaskCardProps = {
  dragging: boolean;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onMove: (taskId: string, status: TaskStatus) => void;
  task: Task;
};

export function TaskCard({
  dragging,
  onDelete,
  onEdit,
  onMove,
  task,
}: TaskCardProps) {
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: task.id,
      data: { status: task.status },
    });

  useEffect(() => {
    function closeMenus(event: PointerEvent) {
      if (!cardRef.current?.contains(event.target as Node)) {
        setActionsMenuOpen(false);
      }
    }

    document.addEventListener('pointerdown', closeMenus);
    return () => document.removeEventListener('pointerdown', closeMenus);
  }, []);

  return (
    <article
      className="task-card"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setActionsMenuOpen(false);
        }
      }}
      ref={(node) => {
        setNodeRef(node);
        cardRef.current = node;
      }}
      style={{
        opacity: dragging ? 0 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div className="task-card__meta">
        <Badge tone={task.priority}>{priorityLabels[task.priority]}</Badge>
        <time dateTime={task.dueDate}>
          до{' '}
          {new Intl.DateTimeFormat('ru-RU', {
            day: 'numeric',
            month: 'short',
          }).format(new Date(`${task.dueDate}T00:00:00`))}
        </time>
      </div>
      <h3>{task.title}</h3>
      <TaskDescription description={task.description} />
      <div className="task-card__footer">
        <Dropdown
          label={`Статус задачи «${task.title}»`}
          onChange={(status) => onMove(task.id, status)}
          options={statusOptions}
          value={task.status}
          variant="compact"
        />
        <Button
          aria-label={`Редактировать «${task.title}»`}
          onClick={() => onEdit(task)}
          variant="ghost"
        >
          Изменить
        </Button>
      </div>
      <button
        aria-label={`Перетащить «${task.title}»`}
        className="task-card__drag"
        type="button"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      <div className="task-card__menu">
        <button
          aria-expanded={actionsMenuOpen}
          aria-haspopup="menu"
          aria-label={`Действия «${task.title}»`}
          className="task-card__actions-trigger"
          onClick={() => setActionsMenuOpen(!actionsMenuOpen)}
          type="button"
        >
          ⋯
        </button>
        {actionsMenuOpen ? (
          <div
            className="task-card__dropdown task-card__dropdown--actions"
            role="menu"
          >
            <button onClick={() => onEdit(task)} role="menuitem" type="button">
              Редактировать
            </button>
            <button
              className="task-card__delete-action"
              onClick={() => onDelete(task.id)}
              role="menuitem"
              type="button"
            >
              Удалить
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
