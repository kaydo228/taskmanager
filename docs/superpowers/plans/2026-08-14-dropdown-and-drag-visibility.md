# Dropdown and Drag Visibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** заменить нативный select приоритета единым кастомным dropdown и гарантировать восстановление видимости карточки сразу после drag.

**Architecture:** Управляемый `Dropdown<T>` живёт в shared UI и получает значение от владельца. Форма связывает его с React Hook Form через `Controller`, карточка использует compact-вариант. Видимость карточки контролируется только Motion через `animate.opacity`, без второго значения `style.opacity`.

**Tech Stack:** React 19, TypeScript, React Hook Form 7, Motion 13, dnd-kit, Vitest, Testing Library, CSS.

## Global Constraints

- Не менять закреплённые версии и не добавлять зависимости.
- Не менять формат задач или localStorage.
- Интерфейс остаётся на русском, TypeScript-имена — на английском.
- Dropdown поддерживает мышь, Tab, Enter, Space, Esc и закрытие кликом вне.
- `prefers-reduced-motion` сохраняет конечные состояния без движения.
- Git-коммиты не входят в шаги: каталог не является Git-репозиторием.

---

### Task 1: Общий управляемый Dropdown

**Files:**

- Create: `packages/shared/src/ui/dropdown.tsx`
- Modify: `packages/shared/src/ui/index.ts`
- Modify: `packages/shared/src/ui/ui.css`
- Create: `apps/dashboard/src/shared/ui/dropdown.test.tsx`

**Interfaces:**

- Consumes: `label: string`, `options: readonly { label: string; value: T }[]`, `value: T`, `onChange(value: T)`, `variant?: 'field' | 'compact'`.
- Produces: `Dropdown<T extends string>` exported from `@taskflow/shared/ui`.

- [ ] **Step 1: Write the failing interaction test**

```tsx
render(
  <Dropdown
    label="Приоритет"
    onChange={onChange}
    options={[{ label: 'Высокий', value: 'high' }]}
    value="medium"
  />,
);
await user.click(screen.getByRole('button', { name: /Приоритет/ }));
await user.click(screen.getByRole('option', { name: 'Высокий' }));
expect(onChange).toHaveBeenCalledWith('high');
```

- [ ] **Step 2: Run RED test**

Run: `pnpm --filter @taskflow/dashboard test -- dropdown.test.tsx`

Expected: FAIL because `Dropdown` is not exported.

- [ ] **Step 3: Implement the controlled component**

```tsx
export type DropdownOption<T extends string> = {
  label: string;
  value: T;
};

type DropdownProps<T extends string> = {
  label: string;
  onChange: (value: T) => void;
  options: readonly DropdownOption<T>[];
  value: T;
  variant?: 'field' | 'compact';
};

export function Dropdown<T extends string>({
  label,
  onChange,
  options,
  value,
  variant = 'field',
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((option) => option.value === value);

  return (
    <div className={`ui-dropdown ui-dropdown--${variant}`} ref={rootRef}>
      {variant === 'field' ? (
        <span className="ui-dropdown__label">{label}</span>
      ) : null}
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        className="ui-dropdown__trigger"
        onClick={() => setOpen((current) => !current)}
        ref={triggerRef}
        type="button"
      >
        {selected?.label}
        <span aria-hidden="true" className="ui-dropdown__chevron" />
      </button>
      {open ? (
        <div className="ui-dropdown__menu" role="listbox">
          {options.map((option) => (
            <button
              aria-selected={option.value === value}
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              role="option"
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Add keyboard/outside-click behavior and Taskflow CSS**

```tsx
useEffect(() => {
  function closeOnOutsidePointer(event: PointerEvent) {
    if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
  }
  document.addEventListener('pointerdown', closeOnOutsidePointer);
  return () =>
    document.removeEventListener('pointerdown', closeOnOutsidePointer);
}, []);

function closeOnEscape(event: React.KeyboardEvent) {
  if (event.key !== 'Escape') return;
  setOpen(false);
  triggerRef.current?.focus();
}
```

```css
.ui-dropdown__chevron {
  border-bottom: 2px solid currentColor;
  border-right: 2px solid currentColor;
  height: 7px;
  transform: rotate(45deg);
  transition: transform 160ms ease;
  width: 7px;
}
.ui-dropdown__trigger[aria-expanded='true'] .ui-dropdown__chevron {
  transform: rotate(225deg);
}
```

- [ ] **Step 5: Run GREEN test**

Run: `pnpm --filter @taskflow/dashboard test -- dropdown.test.tsx`

Expected: PASS.

### Task 2: Подключение dropdown к форме и карточке

**Files:**

- Modify: `apps/dashboard/src/features/task-form/ui/task-form.tsx`
- Modify: `apps/dashboard/src/features/task-form/ui/task-form.test.tsx`
- Modify: `apps/dashboard/src/entities/task/ui/task-card.tsx`
- Modify: `apps/dashboard/src/entities/task/ui/task-card.test.tsx`
- Modify: `apps/dashboard/src/app/styles.css`

**Interfaces:**

- Consumes: `Dropdown<TaskPriority>` и `Dropdown<TaskStatus>` из Task 1.
- Produces: custom priority dropdown в форме и compact status dropdown в карточке.

- [ ] **Step 1: Add failing form submission test**

```tsx
await user.type(screen.getByLabelText('Название задачи'), 'Проверить релиз');
await user.click(screen.getByRole('button', { name: /Приоритет/ }));
await user.click(screen.getByRole('option', { name: 'Высокий' }));
await user.type(screen.getByLabelText('Срок'), '2026-08-20');
await user.click(screen.getByRole('button', { name: 'Сохранить' }));
expect(onSubmit).toHaveBeenCalledWith(
  expect.objectContaining({ priority: 'high' }),
  expect.anything(),
);
```

- [ ] **Step 2: Run RED form test**

Run: `pnpm --filter @taskflow/dashboard test -- task-form.test.tsx`

Expected: FAIL because the form still renders a native combobox.

- [ ] **Step 3: Integrate with React Hook Form Controller**

```tsx
<Controller
  control={control}
  name="priority"
  render={({ field }) => (
    <Dropdown
      label="Приоритет"
      onChange={field.onChange}
      options={priorityOptions}
      value={field.value}
    />
  )}
/>
```

- [ ] **Step 4: Replace the card status menu**

```tsx
<Dropdown
  label={`Статус задачи «${task.title}»`}
  onChange={(status) => onMove(task.id, status)}
  options={statusOptions}
  value={task.status}
  variant="compact"
/>
```

- [ ] **Step 5: Run consumer tests**

Run: `pnpm --filter @taskflow/dashboard test -- task-form.test.tsx task-card.test.tsx`

Expected: PASS.

### Task 3: Восстановление видимости после drag

**Files:**

- Modify: `apps/dashboard/src/entities/task/ui/task-card.tsx`
- Create: `apps/dashboard/src/entities/task/ui/task-card-visibility.test.tsx`

**Interfaces:**

- Consumes: `useSortable().isDragging`.
- Produces: единственное Motion-значение `animate.opacity`, равное `0` во время drag и `1` после него.

- [ ] **Step 1: Write a failing Motion ownership test**

```tsx
sortableState.isDragging = true;
const props = {
  onDelete: vi.fn(),
  onEdit: vi.fn(),
  onMove: vi.fn(),
  task,
};
const { rerender } = render(<TaskCard {...props} />);
expect(screen.getByRole('article')).toHaveAttribute('data-opacity', '0');

sortableState.isDragging = false;
rerender(<TaskCard {...props} />);
expect(screen.getByRole('article')).toHaveAttribute('data-opacity', '1');
```

The test mocks `motion.article` to expose `animate.opacity` through `data-opacity`, and mocks `useSortable` with mutable `sortableState`.

- [ ] **Step 2: Run RED visibility test**

Run: `pnpm --filter @taskflow/dashboard test -- task-card-visibility.test.tsx`

Expected: FAIL because current `animate.opacity` is always `1` and `style.opacity` also owns the property.

- [ ] **Step 3: Give Motion sole ownership of opacity**

```tsx
<motion.article
  animate={{ opacity: isDragging ? 0 : 1, scale: 1 }}
  style={{
    transform: CSS.Transform.toString(transform),
    transition,
  }}
>
```

- [ ] **Step 4: Run GREEN visibility test**

Run: `pnpm --filter @taskflow/dashboard test -- task-card-visibility.test.tsx`

Expected: PASS for `0 → 1` sequence.

### Task 4: Full verification and journal

**Files:**

- Modify: `sessions/session-6.md`
- Modify: `sessions/STATE.md`

- [ ] **Step 1: Run all required checks**

Run: `pnpm build`

Expected: exit 0.

Run: `pnpm test`

Expected: all tests pass.

Run: `pnpm lint`

Expected: exit 0.

Run: `pnpm exec prettier --check packages/shared/src/ui/dropdown.tsx packages/shared/src/ui/index.ts packages/shared/src/ui/ui.css apps/dashboard/src/shared/ui/dropdown.test.tsx apps/dashboard/src/features/task-form/ui/task-form.tsx apps/dashboard/src/features/task-form/ui/task-form.test.tsx apps/dashboard/src/entities/task/ui/task-card.tsx apps/dashboard/src/entities/task/ui/task-card.test.tsx apps/dashboard/src/entities/task/ui/task-card-visibility.test.tsx apps/dashboard/src/app/styles.css docs/superpowers/specs/2026-08-14-dropdown-and-drag-visibility-design.md docs/superpowers/plans/2026-08-14-dropdown-and-drag-visibility.md sessions/session-6.md sessions/STATE.md`

Expected: all matched files use Prettier code style.

- [ ] **Step 2: Update journal and current state**

Record the RED failures, final command output, changed files, and any remaining browser-only limitations in `sessions/session-6.md`; update `sessions/STATE.md` to reflect the current implementation.
