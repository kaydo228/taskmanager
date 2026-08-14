# Board Interaction Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** исправить сортировку карточек, стилизовать меню и добавить безопасные анимации диалога.

**Architecture:** Порядок хранится в существующем массиве `Task[]`. `moveTask` станет единой pure-функцией перестановки, а UI передаст ей id активной задачи, цель и позицию. Стили и анимации остаются локальными компонентам и переиспользуют уже установленный Motion только там, где он требуется.

**Tech Stack:** React 19, TypeScript, @dnd-kit/core, @dnd-kit/sortable, Motion, Vitest, Playwright.

## Global Constraints

- Не менять версии или добавлять зависимости.
- Не менять localStorage как источник данных и не удалять существующие данные.
- Интерфейс и журналы — на русском; TypeScript-имена — на английском.
- Поддержать pointer, touch, keyboard и `prefers-reduced-motion`.

---

### Task 1: Упорядоченное перемещение задачи

**Files:**

- Modify: `apps/dashboard/src/features/move-task/model/move-task.ts`
- Modify: `apps/dashboard/src/features/move-task/model/move-task.test.ts`

**Interfaces:**

- Consumes: `Task[]`, id активной задачи, `TaskStatus`, id соседней задачи.
- Produces: `moveTask(tasks, taskId, status, overTaskId?) => Task[]`.

- [ ] **Step 1: Write the failing test**

```ts
expect(
  moveTask([todoTask, doneTask], doneTask.id, 'todo', todoTask.id),
).toEqual([{ ...doneTask, status: 'todo' }, todoTask]);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @taskflow/dashboard test -- move-task.test.ts`

- [ ] **Step 3: Write minimal implementation**

```ts
export function moveTask(tasks, taskId, status, overTaskId?) {
  // Remove the active task, update its status and insert before overTaskId.
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @taskflow/dashboard test -- move-task.test.ts`

### Task 2: Сортируемая доска

**Files:**

- Modify: `apps/dashboard/src/widgets/task-board/ui/task-board.tsx`
- Modify: `apps/dashboard/src/widgets/task-board/ui/task-column.tsx`
- Modify: `apps/dashboard/src/entities/task/ui/task-card.tsx`
- Modify: `apps/dashboard/src/pages/board-page.tsx`

**Interfaces:**

- Consumes: `moveTask` и ids `Task`/`TaskStatus`.
- Produces: вставку перед карточкой, в конец колонки или в пустую колонку.

- [ ] **Step 1: Write the failing test**

```ts
expect(
  moveTask(tasks, activeId, 'in-progress', overId).map((task) => task.id),
).toEqual(expectedIds);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @taskflow/dashboard test -- move-task.test.ts`

- [ ] **Step 3: Write minimal implementation**

```tsx
<SortableContext
  items={columnTasks.map((task) => task.id)}
  strategy={verticalListSortingStrategy}
>
  <TaskColumn>{cards}</TaskColumn>
</SortableContext>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @taskflow/dashboard test -- move-task.test.ts`

### Task 3: Меню, CTA и модальный переход

**Files:**

- Modify: `apps/dashboard/src/entities/task/ui/task-card.tsx`
- Modify: `apps/dashboard/src/app/styles.css`
- Modify: `apps/dashboard/src/pages/board-page.tsx`
- Modify: `packages/shared/src/ui/dialog.tsx`
- Modify: `packages/shared/src/ui/ui.css`

**Interfaces:**

- Consumes: `onMove`, `onClose`, CSS variables shared UI.
- Produces: доступные меню, светлый CTA и exit-анимация dialog.

- [ ] **Step 1: Write the failing test**

```tsx
await user.click(screen.getByRole('button', { name: /Статус/ }));
await user.keyboard('{Escape}');
expect(screen.queryByRole('menu')).not.toBeInTheDocument();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @taskflow/dashboard test -- task-card.test.tsx`

- [ ] **Step 3: Write minimal implementation**

```tsx
<button aria-expanded={menuOpen} aria-haspopup="menu" type="button">
  {statusLabels[task.status]}
</button>;
{
  menuOpen ? <div role="menu">…</div> : null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @taskflow/dashboard test`

### Task 4: Полная проверка

**Files:**

- Modify: `apps/dashboard/e2e/board.spec.ts`
- Modify: `sessions/session-4.md`

- [ ] **Step 1: Add browser regression**

```ts
await page.getByLabel(/Перетащить/).dragTo(page.getByText('План релиза'));
```

- [ ] **Step 2: Run browser regression**

Run: `pnpm --filter @taskflow/dashboard exec playwright test`

- [ ] **Step 3: Run project verification**

Run: `pnpm build && pnpm test && pnpm lint && pnpm format:check`
