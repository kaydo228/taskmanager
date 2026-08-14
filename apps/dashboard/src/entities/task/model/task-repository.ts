import { z } from 'zod';
import { taskSchema, type Task } from './task';

const storageKey = 'taskflow.tasks';
const tasksSchema = z.array(taskSchema);

export type { Task } from './task';

export function loadTasks(storage: Storage): Task[] {
  const rawValue = storage.getItem(storageKey);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = tasksSchema.safeParse(JSON.parse(rawValue));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export function saveTasks(storage: Storage, tasks: Task[]): void {
  storage.setItem(storageKey, JSON.stringify(tasks));
}
