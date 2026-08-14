# Rich Text Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the task description textarea with a styled Tiptap WYSIWYG editor while preserving the existing `Task.description: string` localStorage contract and rendering formatted descriptions safely in task cards.

**Architecture:** A pure entity-level codec converts between the stored prefixed string and a validated Tiptap JSON document. A feature-level editor connects Tiptap to React Hook Form, while an entity-level static renderer displays the same document in cards without creating an editor per card or injecting HTML.

**Tech Stack:** React 19.2.8, TypeScript 5.9.3, React Hook Form 7.85.0, Tiptap 3.30.1, Vitest 4.1.10, Testing Library, Playwright 1.62.1, CSS.

## Global Constraints

- Keep localStorage as the only data source; do not change its key, task array shape, Zod schema, or `Task.description: string`.
- Pin `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, and `@tiptap/static-renderer` to exactly `3.30.1`; add no other package.
- Preserve legacy plain-text descriptions and fail safely for malformed prefixed documents.
- Never use `dangerouslySetInnerHTML`; task cards must use the Tiptap React static renderer.
- Support paragraph, H2/H3, bold, italic, underline, strike, bullet/ordered lists, blockquote, inline/code block, HTTP(S) links, undo, and redo.
- Use local SVG icons, visible focus, accessible names, keyboard operation, a custom link panel, and responsive toolbar wrapping at 360 px.
- Follow existing FSD import direction and English TypeScript names; UI copy and session documentation stay Russian.
- Follow strict TDD: each behavior test is written and observed failing before production code is added.

---

## File Map

- Create `apps/dashboard/src/entities/task/model/task-description.ts`: pure string/document codec, document validation, and HTTP(S) URL validation.
- Create `apps/dashboard/src/entities/task/model/task-description.test.ts`: codec compatibility and corruption tests.
- Modify `apps/dashboard/src/entities/task/index.ts`: export the codec API.
- Create `apps/dashboard/src/features/task-form/ui/task-description-editor.tsx`: Tiptap editor, toolbar, SVG icons, custom link panel, and controlled-value synchronization.
- Create `apps/dashboard/src/features/task-form/ui/task-description-editor.test.tsx`: real editor behavior, formatting, link validation, and keyboard tests.
- Modify `apps/dashboard/src/features/task-form/ui/task-form.tsx`: replace `textarea` with a React Hook Form `Controller`.
- Modify `apps/dashboard/src/features/task-form/ui/task-form.test.tsx`: verify serialized editor content reaches form submission and existing validation remains intact.
- Create `apps/dashboard/src/entities/task/ui/task-description.tsx`: safe static React rendering with a plain-text fallback.
- Create `apps/dashboard/src/entities/task/ui/task-description.test.tsx`: legacy, formatted, malformed, and unsafe-content rendering tests.
- Modify `apps/dashboard/src/entities/task/ui/task-card.tsx`: render `TaskDescription` instead of a plain paragraph.
- Modify `apps/dashboard/src/app/styles.css`: editor, toolbar, link panel, formatted card content, focus, responsive, and reduced-motion styles.
- Modify `apps/dashboard/e2e/board.spec.ts`: creation, persistence, editing, rich rendering, 360 px layout, and keyboard coverage.
- Modify `apps/dashboard/package.json` and `pnpm-lock.yaml`: exact Tiptap dependencies.
- Modify `sessions/TOOLS.md`: append the Tiptap installation record.
- Modify `sessions/session-9.md` and `sessions/STATE.md`: record implementation evidence and final state.
- Create `sessions/session-9-editor-360.png` and `sessions/session-9-editor-1440.png`: visual verification evidence.

---

### Task 1: Install Tiptap and build the description codec

**Files:**

- Modify: `apps/dashboard/package.json`
- Modify: `pnpm-lock.yaml`
- Create: `apps/dashboard/src/entities/task/model/task-description.test.ts`
- Create: `apps/dashboard/src/entities/task/model/task-description.ts`
- Modify: `apps/dashboard/src/entities/task/index.ts`

**Interfaces:**

- Consumes: stored `Task.description: string`.
- Produces: `TaskDescriptionDocument`, `toTaskDescriptionDocument(value: string)`, `serializeTaskDescription(document: TaskDescriptionDocument)`, and `isSafeTaskLink(value: string)`.

- [ ] **Step 1: Install the four approved exact dependencies**

Run:

```bash
pnpm --filter @taskflow/dashboard add --save-exact @tiptap/react@3.30.1 @tiptap/pm@3.30.1 @tiptap/starter-kit@3.30.1 @tiptap/static-renderer@3.30.1
```

Expected: `apps/dashboard/package.json` lists all four packages as `3.30.1`, and `pnpm-lock.yaml` resolves the same Tiptap release family.

- [ ] **Step 2: Write the failing codec tests**

Create `task-description.test.ts` with literal expectations independent of the implementation:

```ts
import { describe, expect, it } from 'vitest';
import {
  isSafeTaskLink,
  serializeTaskDescription,
  toTaskDescriptionDocument,
} from './task-description';

describe('task description codec', () => {
  it('turns legacy text into an editable paragraph', () => {
    expect(toTaskDescriptionDocument('Старое описание')).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Старое описание' }],
        },
      ],
    });
  });

  it('does not mistake plain JSON-looking text for a document', () => {
    expect(toTaskDescriptionDocument('{"type":"doc"}')).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '{"type":"doc"}' }],
        },
      ],
    });
  });

  it('round-trips a prefixed formatted document', () => {
    const document = {
      type: 'doc' as const,
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Важно', marks: [{ type: 'bold' }] }],
        },
      ],
    };

    const stored = serializeTaskDescription(document);

    expect(stored).toBe(
      'tiptap:{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Важно","marks":[{"type":"bold"}]}]}]}',
    );
    expect(toTaskDescriptionDocument(stored)).toEqual(document);
  });

  it('falls back to text for malformed or unknown prefixed content', () => {
    expect(toTaskDescriptionDocument('tiptap:{broken')).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'tiptap:{broken' }],
        },
      ],
    });
    expect(
      toTaskDescriptionDocument(
        'tiptap:{"type":"doc","content":[{"type":"script"}]}',
      ),
    ).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'tiptap:{"type":"doc","content":[{"type":"script"}]}',
            },
          ],
        },
      ],
    });
  });

  it('accepts only absolute HTTP and HTTPS links', () => {
    expect(isSafeTaskLink('https://example.com/docs')).toBe(true);
    expect(isSafeTaskLink('http://localhost:5173/help')).toBe(true);
    expect(isSafeTaskLink('javascript:alert(1)')).toBe(false);
    expect(isSafeTaskLink('/relative')).toBe(false);
  });
});
```

- [ ] **Step 3: Run the codec tests and verify RED**

Run:

```bash
pnpm --filter @taskflow/dashboard test -- src/entities/task/model/task-description.test.ts
```

Expected: FAIL because `./task-description` does not exist.

- [ ] **Step 4: Implement the minimal validated codec**

Create a recursive structural type with `type`, optional `attrs`, `content`, `marks`, and `text`. Use these exact allowlists:

```ts
const NODE_TYPES = new Set([
  'doc',
  'paragraph',
  'text',
  'heading',
  'bulletList',
  'orderedList',
  'listItem',
  'blockquote',
  'codeBlock',
  'hardBreak',
  'horizontalRule',
]);
const MARK_TYPES = new Set([
  'bold',
  'italic',
  'underline',
  'strike',
  'code',
  'link',
]);
const PREFIX = 'tiptap:';
```

The public behavior is:

```ts
export type TaskDescriptionDocument = TaskDescriptionNode & { type: 'doc' };

export function isSafeTaskLink(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function serializeTaskDescription(document: TaskDescriptionDocument) {
  return `${PREFIX}${JSON.stringify(document)}`;
}

export function toTaskDescriptionDocument(
  value: string,
): TaskDescriptionDocument {
  if (value.startsWith(PREFIX)) {
    try {
      const candidate: unknown = JSON.parse(value.slice(PREFIX.length));
      if (isTaskDescriptionDocument(candidate)) return candidate;
    } catch {
      // The original string is preserved by the plain-text fallback below.
    }
  }
  return plainTextDocument(value);
}
```

`isTaskDescriptionDocument` must recursively reject unknown node/mark types, require `doc` at the root, require string `text` for text nodes, allow only heading levels `2` and `3`, and accept link marks only when their `href` passes `isSafeTaskLink`. `plainTextDocument('')` returns `{ type: 'doc', content: [{ type: 'paragraph' }] }`; non-empty text becomes one text node. Export the four public symbols from `apps/dashboard/src/entities/task/index.ts`.

- [ ] **Step 5: Run codec and dashboard tests and verify GREEN**

Run:

```bash
pnpm --filter @taskflow/dashboard test -- src/entities/task/model/task-description.test.ts
pnpm --filter @taskflow/dashboard test
```

Expected: codec tests PASS and all existing dashboard tests PASS.

- [ ] **Step 6: Commit the codec checkpoint**

```bash
git add apps/dashboard/package.json pnpm-lock.yaml apps/dashboard/src/entities/task/model/task-description.ts apps/dashboard/src/entities/task/model/task-description.test.ts apps/dashboard/src/entities/task/index.ts
git commit -m "feat: add task description codec"
```

---

### Task 2: Build the accessible Tiptap editor

**Files:**

- Create: `apps/dashboard/src/features/task-form/ui/task-description-editor.test.tsx`
- Create: `apps/dashboard/src/features/task-form/ui/task-description-editor.tsx`

**Interfaces:**

- Consumes: `value: string`, `onChange(value: string): void`, optional `onBlur(): void`; codec functions from Task 1.
- Produces: `TaskDescriptionEditor`, an accessible textbox named `Описание` and toolbar commands with Russian accessible names.

- [ ] **Step 1: Write failing editor behavior tests**

Use the real Tiptap component, not a mock. Cover these observable behaviors:

```tsx
it('emits a prefixed document with bold text', async () => {
  const onChange = vi.fn();
  const user = userEvent.setup();
  render(<TaskDescriptionEditor onChange={onChange} value="" />);

  await user.click(screen.getByRole('button', { name: 'Жирный' }));
  await user.type(screen.getByRole('textbox', { name: 'Описание' }), 'Важно');

  await waitFor(() => expect(onChange).toHaveBeenCalled());
  const stored = onChange.mock.calls.at(-1)?.[0] as string;
  expect(stored.startsWith('tiptap:')).toBe(true);
  expect(JSON.parse(stored.slice(7))).toEqual({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Важно' }],
      },
    ],
  });
});

it('emits an empty string after all editor content is removed', async () => {
  const onChange = vi.fn();
  const user = userEvent.setup();
  render(<TaskDescriptionEditor onChange={onChange} value="Старый текст" />);
  const textbox = screen.getByRole('textbox', { name: 'Описание' });

  await user.click(textbox);
  await user.keyboard('{Control>}a{/Control}{Backspace}');

  await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(''));
});

it('shows a local error for an unsafe link and closes the panel with Escape', async () => {
  const user = userEvent.setup();
  render(<TaskDescriptionEditor onChange={vi.fn()} value="Ссылка" />);

  await user.click(screen.getByRole('button', { name: 'Ссылка' }));
  const input = screen.getByRole('textbox', { name: 'Адрес ссылки' });
  await user.type(input, 'javascript:alert(1)');
  await user.click(screen.getByRole('button', { name: 'Применить ссылку' }));
  expect(
    screen.getByText('Введите полный адрес с http:// или https://'),
  ).toBeVisible();

  await user.keyboard('{Escape}');
  expect(
    screen.queryByRole('textbox', { name: 'Адрес ссылки' }),
  ).not.toBeInTheDocument();
});
```

Add one synchronization test: rerender from `value="Первый"` to `value="Второй"` and assert the textbox displays `Второй` without calling `onChange` during initialization.

- [ ] **Step 2: Run editor tests and verify RED**

Run:

```bash
pnpm --filter @taskflow/dashboard test -- src/features/task-form/ui/task-description-editor.test.tsx
```

Expected: FAIL because `TaskDescriptionEditor` does not exist.

- [ ] **Step 3: Implement the editor and toolbar**

Configure one editor instance with:

```ts
StarterKit.configure({
  heading: { levels: [2, 3] },
  link: {
    autolink: false,
    openOnClick: false,
    HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
  },
});
```

Initialize it with `toTaskDescriptionDocument(value)`, `immediatelyRender: false`, and editor attributes:

```ts
{
  'aria-label': 'Описание',
  'aria-multiline': 'true',
  class: 'task-editor__content',
  id: 'task-description',
  role: 'textbox',
}
```

In `onUpdate`, call `onChange(editor.isEmpty ? '' : serializeTaskDescription(editor.getJSON() as TaskDescriptionDocument))`. A `useEffect` compares the incoming stored value with the current serialized editor value and calls `editor.commands.setContent(toTaskDescriptionDocument(value), { emitUpdate: false })` only when they differ.

Render command buttons with `type="button"`, `aria-label`, `title`, `aria-pressed` for toggles, `disabled` from `editor.can()`, and local 18×18 SVG paths. The exact command mapping is:

```ts
[
  ['Абзац', () => editor.chain().focus().setParagraph().run()],
  [
    'Заголовок 2',
    () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  ],
  [
    'Заголовок 3',
    () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  ],
  ['Жирный', () => editor.chain().focus().toggleBold().run()],
  ['Курсив', () => editor.chain().focus().toggleItalic().run()],
  ['Подчёркнутый', () => editor.chain().focus().toggleUnderline().run()],
  ['Зачёркнутый', () => editor.chain().focus().toggleStrike().run()],
  [
    'Маркированный список',
    () => editor.chain().focus().toggleBulletList().run(),
  ],
  [
    'Нумерованный список',
    () => editor.chain().focus().toggleOrderedList().run(),
  ],
  ['Цитата', () => editor.chain().focus().toggleBlockquote().run()],
  ['Строчный код', () => editor.chain().focus().toggleCode().run()],
  ['Блок кода', () => editor.chain().focus().toggleCodeBlock().run()],
  ['Отменить', () => editor.chain().focus().undo().run()],
  ['Повторить', () => editor.chain().focus().redo().run()],
];
```

The link button opens `.task-editor__link-panel`, prefilled from `editor.getAttributes('link').href`. `Применить ссылку` validates with `isSafeTaskLink`, then runs `editor.chain().focus().extendMarkRange('link').setLink({ href }).run()`. `Удалить ссылку` runs `unsetLink()`. Escape clears the error, closes the panel, and calls `editor.commands.focus()`.

- [ ] **Step 4: Run editor tests and verify GREEN**

Run:

```bash
pnpm --filter @taskflow/dashboard test -- src/features/task-form/ui/task-description-editor.test.tsx
```

Expected: all editor tests PASS without console warnings.

- [ ] **Step 5: Commit the editor checkpoint**

```bash
git add apps/dashboard/src/features/task-form/ui/task-description-editor.tsx apps/dashboard/src/features/task-form/ui/task-description-editor.test.tsx
git commit -m "feat: add rich text editor"
```

---

### Task 3: Connect the editor to React Hook Form

**Files:**

- Modify: `apps/dashboard/src/features/task-form/ui/task-form.test.tsx`
- Modify: `apps/dashboard/src/features/task-form/ui/task-form.tsx`

**Interfaces:**

- Consumes: `TaskDescriptionEditor` from Task 2 and existing `TaskFormValues.description: string`.
- Produces: unchanged `TaskFormValues`; formatted content arrives in `onSubmit` as the prefixed string.

- [ ] **Step 1: Add a failing form submission test**

```tsx
it('submits formatted editor content through the existing string field', async () => {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  const { container } = render(<TaskForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText('Название задачи'), 'Описание релиза');
  fireEvent.change(screen.getByLabelText('Срок'), {
    target: { value: '2026-08-20' },
  });
  await user.type(
    screen.getByRole('textbox', { name: 'Описание' }),
    'Новый текст',
  );
  await user.click(screen.getByRole('button', { name: 'Сохранить' }));

  expect(onSubmit.mock.calls[0]?.[0]).toEqual(
    expect.objectContaining({
      description: expect.stringMatching(/^tiptap:/),
      title: 'Описание релиза',
    }),
  );
  expect(container.querySelector('textarea')).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the form test and verify RED**

Run:

```bash
pnpm --filter @taskflow/dashboard test -- src/features/task-form/ui/task-form.test.tsx
```

Expected: FAIL because the current `textarea` returns plain text and the editor toolbar is absent.

- [ ] **Step 3: Replace the textarea with a Controller**

Use this structure in `TaskForm`:

```tsx
<div className="ui-field">
  <span id="task-description-label">Описание</span>
  <Controller
    control={control}
    name="description"
    render={({ field }) => (
      <TaskDescriptionEditor
        onBlur={field.onBlur}
        onChange={field.onChange}
        value={field.value}
      />
    )}
  />
</div>
```

Import `TaskDescriptionEditor`, retain the existing default `description: ''`, and remove only the `textarea` registration.

- [ ] **Step 4: Run form and dashboard tests and verify GREEN**

Run:

```bash
pnpm --filter @taskflow/dashboard test -- src/features/task-form/ui/task-form.test.tsx
pnpm --filter @taskflow/dashboard test
```

Expected: the new form test and all prior dashboard tests PASS.

- [ ] **Step 5: Commit the integration checkpoint**

```bash
git add apps/dashboard/src/features/task-form/ui/task-form.tsx apps/dashboard/src/features/task-form/ui/task-form.test.tsx
git commit -m "feat: use editor in task form"
```

---

### Task 4: Render formatted descriptions safely in cards

**Files:**

- Create: `apps/dashboard/src/entities/task/ui/task-description.test.tsx`
- Create: `apps/dashboard/src/entities/task/ui/task-description.tsx`
- Modify: `apps/dashboard/src/entities/task/ui/task-card.tsx`

**Interfaces:**

- Consumes: stored description string and codec from Task 1.
- Produces: `TaskDescription({ description: string })`, which returns `null` for empty input and safe React content otherwise.

- [ ] **Step 1: Write failing static rendering tests**

```tsx
it('renders legacy descriptions as text', () => {
  render(<TaskDescription description="Обычный текст" />);
  expect(screen.getByText('Обычный текст')).toBeVisible();
});

it('renders formatted JSON as semantic React elements', () => {
  render(
    <TaskDescription
      description={
        'tiptap:{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"План"}]},{"type":"paragraph","content":[{"type":"text","text":"Важно","marks":[{"type":"bold"}]}]}]}'
      }
    />,
  );
  expect(screen.getByRole('heading', { level: 2, name: 'План' })).toBeVisible();
  expect(screen.getByText('Важно').tagName).toBe('STRONG');
});

it('does not execute or inject malformed stored content', () => {
  render(
    <TaskDescription
      description={
        'tiptap:{"type":"doc","content":[{"type":"script","content":[{"type":"text","text":"alert(1)"}]}]}'
      }
    />,
  );
  expect(document.querySelector('script')).not.toBeInTheDocument();
  expect(screen.getByText(/tiptap:/)).toBeVisible();
});
```

Add a fourth test asserting `container` is empty for `description=""`.

- [ ] **Step 2: Run renderer tests and verify RED**

Run:

```bash
pnpm --filter @taskflow/dashboard test -- src/entities/task/ui/task-description.test.tsx
```

Expected: FAIL because `TaskDescription` does not exist.

- [ ] **Step 3: Implement static rendering and card integration**

Use `renderToReactElement` from `@tiptap/static-renderer/pm/react` and the same StarterKit nodes. Configure link attributes with `target="_blank"` and `rel="noopener noreferrer"`. The component boundary is:

```tsx
const taskDescriptionExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    link: {
      HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
    },
  }),
];

export function TaskDescription({ description }: { description: string }) {
  if (!description) return null;

  try {
    return (
      <div className="task-description">
        {renderToReactElement({
          content: toTaskDescriptionDocument(description),
          extensions: taskDescriptionExtensions,
        })}
      </div>
    );
  } catch {
    return (
      <p className="task-description task-description--fallback">
        {description}
      </p>
    );
  }
}
```

Replace `{task.description ? <p>{task.description}</p> : null}` in `TaskCard` with `<TaskDescription description={task.description} />`.

- [ ] **Step 4: Run renderer, card, and dashboard tests and verify GREEN**

Run:

```bash
pnpm --filter @taskflow/dashboard test -- src/entities/task/ui/task-description.test.tsx src/entities/task/ui/task-card.test.tsx
pnpm --filter @taskflow/dashboard test
```

Expected: renderer/card tests and the complete dashboard suite PASS.

- [ ] **Step 5: Commit the rendering checkpoint**

```bash
git add apps/dashboard/src/entities/task/ui/task-description.tsx apps/dashboard/src/entities/task/ui/task-description.test.tsx apps/dashboard/src/entities/task/ui/task-card.tsx
git commit -m "feat: render rich task descriptions"
```

---

### Task 5: Style the editor and prove the browser flow

**Files:**

- Modify: `apps/dashboard/e2e/board.spec.ts`
- Modify: `apps/dashboard/src/app/styles.css`
- Create: `sessions/session-9-editor-360.png`
- Create: `sessions/session-9-editor-1440.png`

**Interfaces:**

- Consumes: editor/card class names from Tasks 2 and 4.
- Produces: Taskflow visual styling, minimum 160 px editor area, wrapping toolbar, compact formatted card content, and persistent browser behavior.

- [ ] **Step 1: Write the failing end-to-end editor test**

```ts
test('creates, persists, and edits a formatted task without horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.getByRole('link', { name: 'Создать задачу' }).click();
  await page.getByLabel('Название задачи').fill('Проверить редактор');
  await page.getByLabel('Срок').fill('2026-08-25');
  await page.getByRole('button', { name: 'Жирный' }).click();
  await page
    .getByRole('textbox', { name: 'Описание' })
    .pressSequentially('Важное описание');

  const editor = page.locator('.task-editor__content');
  await expect(editor).toHaveCSS('min-height', '160px');
  expect(
    await page
      .locator('.task-editor__toolbar')
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);

  await page.getByRole('button', { name: 'Сохранить' }).click();
  const card = page.locator('.task-card', { hasText: 'Проверить редактор' });
  await expect(card.locator('strong')).toHaveText('Важное описание');

  await page.reload();
  await expect(card.locator('strong')).toHaveText('Важное описание');
  await page
    .getByRole('button', {
      name: 'Редактировать «Проверить редактор»',
    })
    .click();
  await expect(page.getByRole('textbox', { name: 'Описание' })).toContainText(
    'Важное описание',
  );
});
```

- [ ] **Step 2: Run the end-to-end test and verify RED**

Run:

```bash
pnpm --filter @taskflow/dashboard exec playwright test e2e/board.spec.ts -g "creates, persists"
```

Expected: FAIL on missing editor styles or formatted card output.

- [ ] **Step 3: Implement the responsive Taskflow styling**

Remove `.task-form textarea` and add these concrete style groups:

```css
.task-editor {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
}
.task-editor:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgb(108 76 255 / 14%);
}
.task-editor__toolbar {
  align-items: center;
  background: #f7f5ff;
  border-bottom: 1px solid var(--line);
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 7px;
}
.task-editor__button {
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 7px;
  color: var(--ink);
  cursor: pointer;
  display: inline-flex;
  height: 32px;
  justify-content: center;
  padding: 0;
  width: 32px;
}
.task-editor__button[aria-pressed='true'] {
  background: #e7e1ff;
  border-color: #bcb3ee;
  color: var(--accent);
}
.task-editor__button:focus-visible {
  outline: 3px solid rgb(108 76 255 / 28%);
  outline-offset: 1px;
}
.task-editor__content {
  font: inherit;
  line-height: 1.55;
  max-height: 320px;
  min-height: 160px;
  overflow-y: auto;
  padding: 12px 14px;
}
.task-editor__content:focus {
  outline: none;
}
.task-editor__link-panel {
  align-items: start;
  background: #fff;
  border-bottom: 1px solid var(--line);
  display: grid;
  gap: 8px;
  grid-template-columns: minmax(0, 1fr) auto auto;
  padding: 10px;
}
.task-description {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.45;
  margin: 0 0 16px;
  overflow-wrap: anywhere;
}
.task-description > :first-child {
  margin-top: 0;
}
.task-description > :last-child {
  margin-bottom: 0;
}
.task-description h2,
.task-description h3 {
  color: var(--ink);
  font-size: 15px;
  margin: 12px 0 5px;
}
.task-description blockquote {
  border-left: 3px solid var(--accent);
  margin: 8px 0;
  padding-left: 9px;
}
.task-description pre {
  max-width: 100%;
  overflow-x: auto;
}
.task-description code {
  background: #f1eff9;
  border-radius: 4px;
  padding: 1px 4px;
}
```

At `max-width: 480px`, make `.task-editor__link-panel` a single column and keep its buttons at least 40 px high. Add reduced-motion rules that remove editor transitions under `prefers-reduced-motion: reduce`.

- [ ] **Step 4: Run browser tests and verify GREEN**

Run:

```bash
pnpm --filter @taskflow/dashboard exec playwright test e2e/board.spec.ts
```

Expected: the existing drag test and new editor flow PASS.

- [ ] **Step 5: Perform visual and keyboard verification**

Open `/tasks/new`, create formatted heading/list/link/code samples, and verify:

- 360×800 and 1440×900 layouts have no horizontal page scroll;
- toolbar wraps, focus is visible, and editor/card content stays within bounds;
- Tab reaches every toolbar command and form field;
- Enter/Space activate commands and Esc closes the link panel;
- browser console has no errors or React warnings.

Save screenshots as `sessions/session-9-editor-360.png` and `sessions/session-9-editor-1440.png`.

- [ ] **Step 6: Commit the visual checkpoint**

```bash
git add apps/dashboard/src/app/styles.css apps/dashboard/e2e/board.spec.ts sessions/session-9-editor-360.png sessions/session-9-editor-1440.png
git commit -m "feat: style rich text descriptions"
```

---

### Task 6: Record tools and run the complete acceptance gate

**Files:**

- Modify: `sessions/TOOLS.md`
- Modify: `sessions/session-9.md`
- Modify: `sessions/STATE.md`

**Interfaces:**

- Consumes: all implementation and verification output from Tasks 1–5.
- Produces: a truthful session verdict and current project state.

- [ ] **Step 1: Append the dependency record to TOOLS.md**

Append exactly one entry for the Tiptap family:

```md
## 2026-08-14 · Сессия 9 · Tiptap v3.30.1

- **Тип:** библиотека
- **Установка:** `pnpm --filter @taskflow/dashboard add --save-exact @tiptap/react@3.30.1 @tiptap/pm@3.30.1 @tiptap/starter-kit@3.30.1 @tiptap/static-renderer@3.30.1`
- **Зачем:** WYSIWYG-редактор описания задачи и безопасный статический React-рендеринг форматирования в карточке.
- **Область:** `apps/dashboard`
- **Проверка:** unit/integration-тесты Vitest, браузерный сценарий Playwright и `pnpm build`.
```

- [ ] **Step 2: Run the full required verification**

Run each command separately and preserve complete output in `sessions/session-9.md`:

```bash
pnpm build
pnpm test
pnpm lint
pnpm format:check
pnpm --filter @taskflow/dashboard exec playwright test
```

Expected: every command exits 0. The known Vite dashboard bundle-size warning may remain and must be recorded rather than hidden.

- [ ] **Step 3: Update the session and state documents**

Set session 9 to `завершена`, list every created/modified file, record the RED and GREEN commands, browser evidence, errors encountered, and the final verdict. Update `sessions/STATE.md` to session 9 with Tiptap in active tools, rich descriptions in completed work, current bundle warning in known issues, and no active functional work.

- [ ] **Step 4: Review the final diff**

Run:

```bash
git diff --check
git status --short
git diff --stat HEAD
```

Expected: no whitespace errors; only editor-related source, tests, dependency metadata, screenshots, and session documentation are changed.

- [ ] **Step 5: Commit the completed session**

```bash
git add sessions/TOOLS.md sessions/session-9.md sessions/STATE.md docs/superpowers/plans/2026-08-14-rich-text-editor.md
git commit -m "docs: close rich text editor session"
```
