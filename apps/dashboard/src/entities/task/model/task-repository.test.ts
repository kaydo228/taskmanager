import { beforeEach, describe, expect, it } from 'vitest';
import { loadTasks, saveTasks, type Task } from './task-repository';

const task: Task = {
  id: '7f5d3f2e-76c6-43a9-9f1f-6e3e12345678',
  title: 'Подготовить демо',
  description: 'Проверить пустое и заполненное состояния.',
  priority: 'high',
  dueDate: '2026-08-15',
  status: 'todo',
  createdAt: '2026-08-13T10:00:00.000Z',
};

describe('task repository', () => {
  beforeEach(() => window.localStorage.clear());

  it('returns an empty list for malformed storage data', () => {
    window.localStorage.setItem('taskflow.tasks', 'not-json');

    expect(loadTasks(window.localStorage)).toEqual([]);
  });

  it('returns an empty list for data with an unknown shape', () => {
    window.localStorage.setItem(
      'taskflow.tasks',
      JSON.stringify([{ title: 42 }]),
    );

    expect(loadTasks(window.localStorage)).toEqual([]);
  });

  it('persists a valid task list', () => {
    saveTasks(window.localStorage, [task]);

    expect(loadTasks(window.localStorage)).toEqual([task]);
  });
});
