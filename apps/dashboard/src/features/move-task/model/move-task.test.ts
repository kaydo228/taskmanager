import { describe, expect, it } from 'vitest';
import type { Task } from '@/entities/task';
import { moveTask } from './move-task';

const todoTask: Task = {
  id: '7f5d3f2e-76c6-43a9-9f1f-6e3e12345678',
  title: 'План релиза',
  description: '',
  priority: 'high',
  dueDate: '2026-08-15',
  status: 'todo',
  createdAt: '2026-08-13T10:00:00.000Z',
};

const doneTask: Task = {
  ...todoTask,
  id: '4c1e8e11-5a2b-4d2f-86d7-019cadc8d111',
  status: 'done',
};

describe('moveTask', () => {
  it('moves one task to the end of the destination column', () => {
    expect(moveTask([todoTask, doneTask], todoTask.id, 'in-progress')).toEqual([
      doneTask,
      { ...todoTask, status: 'in-progress' },
    ]);
  });

  it('inserts a moved task before the task it is dropped over', () => {
    expect(
      moveTask([todoTask, doneTask], doneTask.id, 'todo', todoTask.id),
    ).toEqual([{ ...doneTask, status: 'todo' }, todoTask]);
  });

  it('inserts a moved task after the task it is dropped below', () => {
    expect(
      moveTask([todoTask, doneTask], todoTask.id, 'done', doneTask.id, true),
    ).toEqual([doneTask, { ...todoTask, status: 'done' }]);
  });
});
