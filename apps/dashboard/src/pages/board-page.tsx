import { useState } from 'react';
import { sileo } from 'sileo';
import { Button } from '@taskflow/shared/ui';
import {
  createDemoTasks,
  loadTasks,
  saveTasks,
  type Task,
  type TaskStatus,
} from '@/entities/task';
import { moveTask } from '@/features/move-task/model/move-task';
import { EmptyBoard } from '@/widgets/empty-board/ui/empty-board';
import { TaskBoard } from '@/widgets/task-board/ui/task-board';

export const landingUrl =
  import.meta.env.VITE_LANDING_URL ?? 'http://localhost:3001';

export function BoardPage() {
  const [tasks, setTasks] = useState<Task[]>(() =>
    loadTasks(window.localStorage),
  );

  function updateTasks(nextTasks: Task[]) {
    saveTasks(window.localStorage, nextTasks);
    setTasks(nextTasks);
  }

  function loadDemo() {
    updateTasks(createDemoTasks());
    sileo.success({ title: 'Демо-задачи загружены' });
  }

  function clearBoard() {
    updateTasks([]);
    sileo.info({ title: 'Доска очищена' });
  }

  function changeStatus(
    taskId: string,
    status: TaskStatus,
    overTaskId?: string,
    insertAfter?: boolean,
  ) {
    updateTasks(moveTask(tasks, taskId, status, overTaskId, insertAfter));
    sileo.success({ title: 'Статус задачи обновлён' });
  }

  function deleteTask(taskId: string) {
    updateTasks(tasks.filter((task) => task.id !== taskId));
    sileo.success({ title: 'Задача удалена' });
  }

  return (
    <main className="dashboard-page">
      <a className="dashboard-page__brand" href={landingUrl}>
        taskflow<span>.</span>
      </a>
      <section className="dashboard-page__heading">
        <div>
          <p className="eyebrow">Личный кабинет</p>
          <h1>Дела в движении</h1>
          <p>Перетаскивай задачи между этапами или меняй статус без мыши.</p>
        </div>
        <div className="dashboard-page__actions">
          <a
            className="ui-button ui-button--primary dashboard-page__create"
            href="/tasks/new"
            style={{ color: '#fff' }}
          >
            Создать задачу
          </a>
          {tasks.length ? (
            <Button onClick={clearBoard} variant="danger">
              Очистить доску
            </Button>
          ) : null}
        </div>
      </section>

      {tasks.length ? (
        <TaskBoard
          onDelete={deleteTask}
          onEdit={(task) => {
            window.location.href = `/tasks/${task.id}/edit`;
          }}
          onMove={changeStatus}
          tasks={tasks}
        />
      ) : (
        <EmptyBoard onLoadDemo={loadDemo} />
      )}
    </main>
  );
}
