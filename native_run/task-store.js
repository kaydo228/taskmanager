export function addTask(tasks, title, status = 'inbox') {
  const cleanTitle = title.trim();
  if (!cleanTitle) throw new Error('Введите название задачи');

  return [{ id: crypto.randomUUID(), title: cleanTitle, status, createdAt: Date.now() }, ...tasks];
}

export function moveTask(tasks, id, status) {
  return tasks.map((task) => (task.id === id ? { ...task, status } : task));
}
