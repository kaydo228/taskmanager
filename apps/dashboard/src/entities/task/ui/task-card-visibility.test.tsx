import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import type { Task } from '@/entities/task';
import { TaskCard } from './task-card';

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    isDragging: true,
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
  }),
}));

const task: Task = {
  id: '7f5d3f2e-76c6-43a9-9f1f-6e3e12345678',
  title: 'План релиза',
  description: '',
  priority: 'high',
  dueDate: '2026-08-15',
  status: 'todo',
  createdAt: '2026-08-13T10:00:00.000Z',
};

it('stays visible after board drag state clears even if sortable state is stale', () => {
  const props = {
    dragging: false,
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    onMove: vi.fn(),
    task,
  };
  render(<TaskCard {...props} />);

  expect(screen.getByRole('article').style.opacity).toBe('1');
});
