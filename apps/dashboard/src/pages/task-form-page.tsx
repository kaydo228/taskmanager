import { useNavigate, useParams } from 'react-router-dom';
import { sileo } from 'sileo';
import { Dialog } from '@taskflow/shared/ui';
import { loadTasks, saveTasks, type Task } from '@/entities/task';
import {
  TaskForm,
  type TaskFormValues,
} from '@/features/task-form/ui/task-form';

export function TaskFormPage() {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const tasks = loadTasks(window.localStorage);
  const currentTask = tasks.find((task) => task.id === taskId);
  const isEditing = Boolean(taskId);

  function close() {
    navigate('/board');
  }

  function handleSubmit(values: TaskFormValues) {
    const now = new Date().toISOString();
    const nextTask: Task = currentTask
      ? { ...currentTask, ...values }
      : { ...values, id: crypto.randomUUID(), status: 'todo', createdAt: now };
    const nextTasks = currentTask
      ? tasks.map((task) => (task.id === nextTask.id ? nextTask : task))
      : [...tasks, nextTask];

    saveTasks(window.localStorage, nextTasks);
    sileo.success({ title: isEditing ? 'Задача обновлена' : 'Задача создана' });
    close();
  }

  return (
    <Dialog
      onClose={close}
      open
      title={isEditing ? 'Редактировать задачу' : 'Новая задача'}
    >
      <TaskForm defaultValues={currentTask} onSubmit={handleSubmit} />
    </Dialog>
  );
}
