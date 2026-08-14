# Taskflow Board Polish Implementation Plan

**Goal:** добавить motion лендинга, быстрые действия карточек, drag overlay, кастомные меню и добавление задач в колонку.

1. Написать RED-тесты добавления в заданный статус, удаления и открытия action-menu.
2. Реализовать `TaskCardMenu`, `StatusMenu`, `DragOverlay`, `onDelete` и `initialStatus` формы; заменить native select.
3. Добавить кнопки колонок и Motion-обёртки всех разделов лендинга с reduced-motion.
4. Проверить `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm format:check` и адаптив 360/1440 px.
