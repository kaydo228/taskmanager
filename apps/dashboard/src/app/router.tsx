import { createBrowserRouter } from 'react-router-dom';
import { BoardPage } from '@/pages/board-page';
import { TaskFormPage } from '@/pages/task-form-page';

export const router = createBrowserRouter([
  { path: '/', element: <BoardPage /> },
  { path: '/board', element: <BoardPage /> },
  { path: '/tasks/new', element: <TaskFormPage /> },
  { path: '/tasks/:taskId/edit', element: <TaskFormPage /> },
]);
