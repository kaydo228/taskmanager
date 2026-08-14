# Taskflow Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** добавить доступные смысловые Motion-переходы к обоим приложениям и осветлить текст главной кнопки кабинета.

**Architecture:** пакет `motion` подключается отдельно в landing и dashboard. Переходы живут рядом с компонентами, а `useReducedMotion()` заменяет их конечным состоянием.

**Tech Stack:** Motion for React, React, Next.js, Vite, Vitest.

## Global Constraints

- Движение длится 160–320 мс и не мешает фокусу, Tab, Enter, Space или Esc.
- `prefers-reduced-motion` отключает переходы.
- Главная кнопка «Создать задачу» имеет светлый текст на фиолетовом фоне.

---

### Task 1: Add Motion and shared variants

**Files:**

- Modify: `apps/landing/package.json`, `apps/dashboard/package.json`
- Create: `apps/dashboard/src/shared/lib/motion.ts`
- Test: `apps/dashboard/src/shared/ui/button.test.tsx`

- [ ] **Step 1: Write the failing contrast assertion**

```tsx
expect(screen.getByRole('link', { name: 'Создать задачу' })).toHaveClass(
  'ui-button--primary',
);
```

- [ ] **Step 2: Run RED**

Run: `pnpm --filter @taskflow/dashboard test -- board-page.test.tsx`

Expected: FAIL before the primary CTA uses the shared button class.

- [ ] **Step 3: Install and define minimal variants**

Run: `pnpm --filter @taskflow/landing add motion` and `pnpm --filter @taskflow/dashboard add motion`.

Create:

```ts
export const reveal = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};
export const reducedTransition = { duration: 0 };
```

- [ ] **Step 4: Run GREEN**

Run: `pnpm --filter @taskflow/dashboard test -- board-page.test.tsx`

Expected: PASS.

### Task 2: Animate landing and dashboard

**Files:**

- Modify: `apps/landing/src/app/page.tsx`, `apps/dashboard/src/pages/board-page.tsx`
- Modify: `apps/dashboard/src/widgets/task-board/ui/task-board.tsx`, `apps/dashboard/src/entities/task/ui/task-card.tsx`
- Modify: `apps/dashboard/src/app/styles.css`

- [ ] **Step 1: Wrap visual groups with Motion components**

Use `motion.section` with staggered `variants` on landing sections. Use `AnimatePresence` and `motion.article layout` for cards; animate form/board state entry with opacity and 12–16 px y transition.

- [ ] **Step 2: Respect reduced motion**

Use `useReducedMotion()` to set transition duration to zero. Retain existing CSS media query as a second layer.

- [ ] **Step 3: Verify**

Run: `pnpm build && pnpm test && pnpm lint && pnpm format:check`.

Expected: all commands exit 0.
