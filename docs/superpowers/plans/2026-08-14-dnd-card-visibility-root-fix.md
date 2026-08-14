# DnD Card Visibility Root Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** гарантировать синхронную видимость карточки после первого drop между колонками, даже если внутренний `useSortable.isDragging` ещё содержит устаревшее значение.

**Architecture:** `TaskBoard.activeTask` становится единственным источником состояния скрытия исходной карточки. `TaskCard` больше не использует Motion: обычный `article` получает opacity из board-prop, а transform/transition — только из dnd-kit.

**Tech Stack:** React 19, TypeScript, dnd-kit, Vitest, Testing Library, CSS.

## Global Constraints

- Не менять формат задач или localStorage.
- Не добавлять зависимости и не менять закреплённые версии.
- Не менять dropdown, модальные анимации и DragOverlay.
- Git-коммиты не выполняются: каталог не является Git-репозиторием.

---

### Task 1: Один владелец видимости draggable-карточки

**Files:**

- Modify: `apps/dashboard/src/entities/task/ui/task-card-visibility.test.tsx`
- Modify: `apps/dashboard/src/entities/task/ui/task-card.tsx`
- Modify: `apps/dashboard/src/widgets/task-board/ui/task-board.tsx`
- Modify: `sessions/session-7.md`
- Modify: `sessions/STATE.md`

**Interfaces:**

- Consumes: `TaskBoard.activeTask: Task | null`, `useSortable()` transform/transition/listeners/attributes.
- Produces: `TaskCardProps.dragging: boolean`; synchronous `style.opacity` equal to `0` only while board-owned drag is active, otherwise `1`.

- [ ] **Step 1: Rewrite the visibility regression test to model stale dnd-kit state**

Keep the `useSortable` mock returning `isDragging: true`, pass a separate board-owned `dragging: false`, and assert real DOM style:

```tsx
it('stays visible after board drag state clears even if sortable state is stale', () => {
  const props = {
    dragging: false,
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    onMove: vi.fn(),
    task,
  };

  render(<TaskCard {...props} />);

  expect(screen.getByRole('article')).toHaveStyle({ opacity: '1' });
});
```

- [ ] **Step 2: Run RED test**

Run: `pnpm --filter @taskflow/dashboard test -- task-card-visibility.test.tsx`

Expected: FAIL because current `TaskCard` ignores `dragging` and Motion receives stale `useSortable.isDragging = true`.

- [ ] **Step 3: Make TaskCard visibility board-owned and remove Motion from the draggable node**

Change the component interface:

```tsx
type TaskCardProps = {
  dragging: boolean;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onMove: (taskId: string, status: TaskStatus) => void;
  task: Task;
};

export function TaskCard({
  dragging,
  onDelete,
  onEdit,
  onMove,
  task,
}: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id, data: { status: task.status } });
}
```

Replace only the Motion-owned root props while keeping the existing children unchanged:

```diff
-    <motion.article
-      animate={{ opacity: isDragging ? 0 : 1, scale: 1 }}
+    <article
       className="task-card"
-      initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.96 }}
-      layout
       onKeyDown={(event) => {
         if (event.key === 'Escape') {
           setActionsMenuOpen(false);
         }
       }}
       ref={(node) => {
         setNodeRef(node);
         cardRef.current = node;
       }}
       style={{
+        opacity: dragging ? 0 : 1,
         transform: CSS.Transform.toString(transform),
         transition,
       }}
-      transition={{ duration: reducedMotion ? 0 : 0.2 }}
     >
-    </motion.article>
+    </article>
```

Remove `motion` and `useReducedMotion` imports, `initial`, `animate`, `layout` and Motion `transition` props.

- [ ] **Step 4: Pass board-owned drag state to every card**

```tsx
<TaskCard
  dragging={activeTask?.id === task.id}
  key={task.id}
  onDelete={onDelete}
  onEdit={onEdit}
  onMove={onMove}
  task={task}
/>
```

Keep existing `setActiveTask(null)` calls in `onDragEnd` and `onDragCancel`.

- [ ] **Step 5: Run GREEN test and the full unit suite**

Run: `pnpm --filter @taskflow/dashboard test -- task-card-visibility.test.tsx`

Expected: dashboard reports all tests passing, including the stale sortable-state regression.

- [ ] **Step 6: Reproduce pointer drop between columns in the browser**

Move one task from «Нужно сделать» between two cards in «В работе». After the DragOverlay disappears, inspect the moved article:

```js
({
  column: card.closest('section')?.getAttribute('aria-label'),
  opacity: getComputedStyle(card).opacity,
});
```

Expected: `{ column: 'В работе', opacity: '1' }` after the first drag, with no second drag.

- [ ] **Step 7: Run project verification**

Run:

```bash
pnpm build
pnpm test
pnpm lint
pnpm exec prettier --check <all files changed in session 7>
pnpm format:check
```

Expected: build, tests, lint and touched-file formatting pass. Full format check may continue reporting only the four pre-existing files recorded in `sessions/STATE.md`.

- [ ] **Step 8: Finish the session journal**

Record RED/GREEN outputs, browser opacity evidence, changed files and remaining unrelated warnings in `sessions/session-7.md`; update `sessions/STATE.md` to session 7.
