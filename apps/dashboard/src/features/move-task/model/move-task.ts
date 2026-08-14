import type { Task, TaskStatus } from '@/entities/task';

export function moveTask(
  tasks: Task[],
  taskId: string,
  status: TaskStatus,
  overTaskId?: string,
  insertAfter = false,
): Task[] {
  const task = tasks.find((item) => item.id === taskId);

  if (!task) return tasks;

  const remainingTasks = tasks.filter((item) => item.id !== taskId);
  const movedTask = { ...task, status };
  const overTaskIndex = overTaskId
    ? remainingTasks.findIndex((item) => item.id === overTaskId)
    : -1;

  if (overTaskIndex >= 0) {
    const insertionIndex = overTaskIndex + Number(insertAfter);
    return [
      ...remainingTasks.slice(0, insertionIndex),
      movedTask,
      ...remainingTasks.slice(insertionIndex),
    ];
  }

  const lastTaskInColumn = remainingTasks.reduce(
    (lastIndex, item, index) => (item.status === status ? index : lastIndex),
    -1,
  );
  const insertionIndex =
    lastTaskInColumn < 0 ? remainingTasks.length : lastTaskInColumn + 1;

  return [
    ...remainingTasks.slice(0, insertionIndex),
    movedTask,
    ...remainingTasks.slice(insertionIndex),
  ];
}
