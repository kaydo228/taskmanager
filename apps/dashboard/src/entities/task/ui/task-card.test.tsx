import { DndContext } from '@dnd-kit/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import type { Task } from '@/entities/task';
import { TaskCard } from './task-card';

const task: Task = {
  id: '7f5d3f2e-76c6-43a9-9f1f-6e3e12345678',
  title: 'План релиза',
  description: '',
  priority: 'high',
  dueDate: '2026-08-15',
  status: 'todo',
  createdAt: '2026-08-13T10:00:00.000Z',
};

it('changes status through a custom dropdown', async () => {
  const onMove = vi.fn();
  const user = userEvent.setup();

  render(
    <DndContext>
      <TaskCard
        dragging={false}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onMove={onMove}
        task={task}
      />
    </DndContext>,
  );

  await user.click(
    screen.getByRole('button', {
      name: 'Статус задачи «План релиза»: Нужно сделать',
    }),
  );
  await user.click(screen.getByRole('option', { name: 'В работе' }));

  expect(onMove).toHaveBeenCalledWith(task.id, 'in-progress');
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
});
