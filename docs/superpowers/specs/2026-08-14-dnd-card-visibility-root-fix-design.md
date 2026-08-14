# DnD Card Visibility Root Fix Design

## Цель

После первого pointer- или keyboard-drop карточка должна быть видимой в целевой позиции без дополнительного drag и без временной пустоты, зависящей от Motion.

## Подтверждённая причина

При переносе между колонками карточка переходит между разными `SortableContext`, поэтому React размонтирует старый `TaskCard` и монтирует новый. Во время pointer drop-animation внутренний active dnd-kit ещё указывает на переносимую задачу. Новый `useSortable` получает `isDragging = true`, а Motion устанавливает новому элементу `opacity: 0`. После удаления overlay этот экземпляр может остаться прозрачным до следующего обновления dnd-kit.

Браузерная диагностика подтвердила состояние через 500 мс после drop: карточка уже находится в DOM целевой колонки, overlay удалён, inline и вычисленный `opacity` равны `0`.

## Решение

У draggable-узла будет один владелец каждого аспекта состояния:

- `TaskBoard.activeTask` управляет только скрытием исходной карточки;
- dnd-kit управляет `transform`, `transition`, listeners и attributes;
- Motion больше не оборачивает `TaskCard` и не управляет его `opacity` или `transform`;
- Motion остаётся в модальных окнах и других независимых элементах.

`TaskBoard` передаёт каждой карточке `dragging={activeTask?.id === task.id}`. На `onDragStart` активная карточка скрывается, на `onDragEnd` и `onDragCancel` `activeTask` сбрасывается. Новый экземпляр в целевой колонке получает `dragging = false` сразу после завершения обработчика и отображается с `opacity: 1`, независимо от внутренней drop-animation dnd-kit.

`TaskCard` становится обычным `<article>` и сохраняет `useSortable` только для dnd-kit transform, transition, ref, listeners и attributes.

## Проверка

Регрессионный unit-тест моделирует опасное состояние: `useSortable.isDragging` остаётся `true`, но board-prop `dragging` уже равен `false`. Карточка обязана иметь `opacity: 1`. Второе утверждение проверяет `dragging = true` и `opacity: 0` во время активного переноса.

После GREEN-теста выполняется реальный pointer-drag между колонками. Проверяются DOM-позиция и вычисленный `opacity: 1` сразу после завершения drop-animation, затем полный `pnpm build`, `pnpm test`, `pnpm lint` и проверки Prettier.

## Границы

- Формат задач и localStorage не меняются.
- Зависимости и их версии не меняются.
- Входная fade/scale-анимация карточек удаляется; стабильность DnD важнее декоративной анимации.
- Анимации модалок и DragOverlay сохраняются.
