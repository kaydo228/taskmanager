# Homework Compliance Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete every currently provable homework deliverable, add fresh acceptance evidence and an independent audit, and document historical gaps without fabricating them.

**Architecture:** Treat the repository as a submission package with three evidence layers: an operator-facing `README.md`, a requirement-to-artifact matrix, and reproducible automated/browser checks. Preserve historical journals and screenshots; only current documentation, acceptance automation, fresh screenshots, and the live session are changed.

**Tech Stack:** Markdown, Git, pnpm 11.19.0, Turborepo 2.10.9, Vitest 4.1.10, Playwright 1.62.1, React 19.2.8, Next.js 16.3.0, Vite 8.2.1.

## Global Constraints

- Work directly in `main` and push to `origin/main`, as requested by the user.
- Do not edit `homework.pdf`, `materials/`, `sessions/session-1.md`, old session verdicts, old screenshots, demo task snapshots, or Part I of `AGENTS.md`.
- Do not fabricate a naive run, a pre-improvement screenshot, a prompt, a command output, or an independent finding.
- Add no dependency and do not change application behavior unless the independent audit demonstrates a direct acceptance failure.
- Preserve the current `Task.description: string` and localStorage contract.
- Use exact repository evidence for every `закрыто` matrix row; use `частично` or `отсутствует` otherwise.
- Keep README and submission documents in Russian; code and test identifiers remain English.

---

## File Map

- Replace `README.md`: actual project operation and honest submission report.
- Modify only Part II of `AGENTS.md`: ports, named states, and additional stop conditions.
- Modify `SPEC.md`: completion marks only, with requirement wording unchanged.
- Create `docs/submission-requirements.md`: complete homework/front-end/final-checklist evidence matrix.
- Modify `apps/dashboard/e2e/board.spec.ts`: automate fresh responsive screenshots and missing acceptance scenarios.
- Create `screenshots/submission-board-360.png` and `screenshots/submission-board-1440.png`: same demo dataset at required widths.
- Create `docs/independent-audit.md`: independent reviewer findings and project verdicts.
- Modify `sessions/session-11.md` and `sessions/STATE.md`: live process and final state.
- Modify this plan only to mark executed checkboxes.

---

### Task 1: Build the honest submission documentation

**Files:**

- Modify: `README.md`
- Modify: `AGENTS.md` Part II only
- Modify: `SPEC.md` completion marks only
- Create: `docs/submission-requirements.md`

**Interfaces:**

- Consumes: package scripts, current architecture, `homework.pdf`, session evidence, screenshots, and Git history.
- Produces: clean-machine instructions and a one-to-one requirement evidence map.

- [x] **Step 1: Capture the immutable Part I checksum**

Run:

```bash
awk '/^# Часть II/{exit} {print}' AGENTS.md | shasum -a 256
```

Expected literal result:

```text
780f0ea9f156f64fd30b960bbee1433d1988b078ff4244559dbcc3122e6edcff  -
```

- [x] **Step 2: Replace README with actual project instructions**

Write `README.md` with these sections and facts:

```markdown
# Taskflow

Taskflow — учебный frontend-проект: Next.js-лендинг и локальная React-доска задач. Мини-доска выбрана из frontend-раздела homework.pdf, потому что на ней проверяются состояния, persistence, drag-and-drop и клавиатурная альтернатива.

## Возможности

- пустая доска, девять демо-задач и ошибка обязательного названия;
- создание, редактирование, удаление, статус и сортировка между карточками;
- WYSIWYG-описание задачи;
- localStorage с безопасным сбросом повреждённых данных;
- мышь, touch, Tab, Enter, Space и Esc;
- адаптивные 360/1440 px и prefers-reduced-motion.

## Требования

- Node.js 24.x (проверено на 24.16.0);
- pnpm 11.19.0.

## Установка и запуск

git clone https://github.com/kaydo228/taskmanager.git
cd taskmanager
pnpm install --frozen-lockfile
pnpm dev

Лендинг: http://localhost:3001
Доска: http://localhost:5173/board

## Переменные окружения

- dashboard: VITE_LANDING_URL;
- landing: NEXT_PUBLIC_DASHBOARD_URL.

Локально переменные не обязательны: используются порты выше.

## Проверка

pnpm build
pnpm test
pnpm lint
pnpm format:check
pnpm --filter @taskflow/dashboard exec playwright test

## Архитектура и данные

Опишите apps/landing, apps/dashboard, packages/shared/src/ui, FSD-слои и строковый localStorage-контракт без сервера.

## Доказательства

Сошлитесь на SPEC.md, AGENTS.md, docs/submission-requirements.md, docs/independent-audit.md, sessions/, screenshots/submission-board-360.png и screenshots/submission-board-1440.png.

## Допущения и ограничения

Явно перечислите отсутствие сервера/аккаунтов/синхронизации, известное предупреждение bundle >500 kB, отсутствие сохранённого наивного прогона, настоящего before-скриншота и незаполненный шаблон session-1.md. Укажите, что эти исторические пробелы не реконструировались задним числом.

## Что не сделано

Повторите три исторических пробела как незакрытые требования, а не как будущие функции продукта.
```

Use fenced `bash` blocks for commands and repository-relative Markdown links for evidence.

- [x] **Step 3: Tighten only Part II of AGENTS.md**

Under `Как запускать и проверять`, add:

```markdown
Локальные адреса фиксированы: лендинг — `http://localhost:3001`, dashboard — `http://localhost:5173/board`. Если порт занят, агент сначала сообщает конфликт и спрашивает, можно ли менять порт или останавливать процесс.
```

Under `Когда агент обязан остановиться и спросить`, add:

```markdown
- Логическая правка требует изменения визуального направления, дизайн-токенов или скриншотов «до».
- Предлагается сменить порты `3001`/`5173` или формат сохранённых задач.
```

Under `Что проверить перед финальным ответом`, define the states exactly:

```markdown
- Проверить три контрактных состояния: пустая доска после очистки; заполненная доска после кнопки «Загрузить демо-данные» (9 задач); ошибочное состояние после отправки формы без названия.
```

Remove the older generic states bullet so the check is not duplicated. Do not modify any text before `# Часть II. Настройки проекта`.

- [x] **Step 4: Create the complete requirements matrix**

Create `docs/submission-requirements.md` with sections `Обязательная часть`, `Frontend`, `Состав сдачи`, and `Финальный чек-лист`. Use columns:

```markdown
| Требование | Статус | Доказательство | Комментарий |
```

Include these explicit rows:

- context/rules loaded — `частично`, because `session-1.md` stayed a template but session 2 records the actual project start;
- final SPEC — `закрыто`, `SPEC.md` and session 2;
- project-specific AGENTS Part II — `закрыто`;
- naive run — `отсутствует`;
- working specification run — `закрыто`;
- manual/automated verification — `закрыто` after Task 2;
- independent audit — `частично` until Task 3;
- working README — `частично` until the public clone check;
- public repository — `закрыто`, with `https://github.com/kaydo228/taskmanager` and unauthenticated HTTP 200;
- naive/final comparison — `отсутствует` because the source run is absent;
- three interface states — `закрыто` with exact UI actions and tests;
- 360/1440 widths — `закрыто` after Task 2 screenshots;
- localStorage validation — `закрыто` with `task-repository.test.ts`;
- keyboard/browser agent — `закрыто` with `board.spec.ts`, editor and dialog tests;
- design before/after pair — `отсутствует`;
- screenshots/evidence — `закрыто` after Task 2;
- secrets absent — `частично` until Task 4 scan;
- repository opens externally — `закрыто` after Task 4 public clone;
- honest limitations — `закрыто` via README and this matrix.

At the top define statuses. At the bottom add `Исторические пробелы` stating that missing artifacts were not reconstructed.

- [x] **Step 5: Mark verified SPEC acceptance criteria complete**

Change each `- [ ]` under `## Критерии приёмки` in `SPEC.md` to `- [x]`. Do not edit any criterion wording. The existing test/browser evidence covers all 12 product criteria; the homework submission gaps belong in the matrix, not the product spec.

- [x] **Step 6: Verify documentation integrity**

Run:

```bash
awk '/^# Часть II/{exit} {print}' AGENTS.md | shasum -a 256
rg -n "TBD|TODO|\[\.\.\.\]|допишите тут" README.md docs/submission-requirements.md
pnpm exec prettier --write README.md AGENTS.md SPEC.md docs/submission-requirements.md sessions/session-11.md
pnpm format:check
git diff --check
```

Expected: Part I checksum remains `780f0ea9...edcff`; placeholder search returns no matches; formatting and whitespace checks exit `0`.

- [x] **Step 7: Commit the submission documentation**

```bash
git add README.md AGENTS.md SPEC.md docs/submission-requirements.md sessions/session-11.md
git commit -m "docs: complete homework submission guide"
```

---

### Task 2: Add reproducible acceptance evidence

**Files:**

- Modify: `apps/dashboard/e2e/board.spec.ts`
- Create: `screenshots/submission-board-360.png`
- Create: `screenshots/submission-board-1440.png`
- Modify: `docs/submission-requirements.md`
- Modify: `sessions/session-11.md`

**Interfaces:**

- Consumes: existing demo data, form validation, localStorage repository behavior, and Playwright web server.
- Produces: repeatable browser assertions and same-data responsive screenshots.

- [x] **Step 1: Add responsive evidence to the populated-board scenario**

After `План релиза` becomes visible and before the existing reload in the first e2e test, add:

```ts
await page.setViewportSize({ width: 360, height: 800 });
await page.screenshot({
  fullPage: true,
  path: '../../screenshots/submission-board-360.png',
});
await page.setViewportSize({ width: 1440, height: 900 });
await page.screenshot({
  fullPage: true,
  path: '../../screenshots/submission-board-1440.png',
});
```

- [x] **Step 2: Add the missing acceptance scenario**

Append this test:

```ts
test('recovers from malformed storage and exposes the validation error through the UI', async ({
  page,
}) => {
  await page.evaluate(() =>
    window.localStorage.setItem('taskflow.tasks', 'not-json'),
  );
  await page.reload();
  await expect(page.getByText('Доска пока пуста')).toBeVisible();

  await page.getByRole('link', { name: 'Создать задачу' }).click();
  await page.getByRole('button', { name: 'Сохранить' }).click();
  await expect(page.getByText('Введите название')).toBeVisible();
  await expect(page.getByLabel('Название задачи')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});
```

This is a characterization/acceptance test for already implemented behavior; no production change is expected.

- [x] **Step 3: Run the browser suite and inspect both images**

Run:

```bash
pnpm --filter @taskflow/dashboard exec playwright test
file screenshots/submission-board-360.png screenshots/submission-board-1440.png
```

Expected: 4 Playwright tests PASS; files report widths `360` and `1440` (full-page heights vary with responsive layout). Open both with `view_image` and verify no horizontal clipping, overlapping controls, stale drag opacity, transient toast, or unfinished modal animation.

If Playwright rewrites a historical session-9 screenshot, restore only that generated diff from current `HEAD` and record the action.

- [x] **Step 4: Run the full local repository gate**

Run:

```bash
pnpm build
pnpm test
pnpm lint
pnpm format:check
```

Expected: all commands exit `0`; the known dashboard chunk-size warning is recorded, not hidden.

- [x] **Step 5: Update evidence rows and commit**

Change only Task 2-dependent matrix rows from `частично` to `закрыто`, record exact test counts and image paths in session 11, then run `git diff --check` and commit:

```bash
git add apps/dashboard/e2e/board.spec.ts screenshots/submission-board-360.png screenshots/submission-board-1440.png docs/submission-requirements.md sessions/session-11.md
git commit -m "test: add homework acceptance evidence"
```

---

### Task 3: Perform the independent audit

**Files:**

- Create: `docs/independent-audit.md`
- Modify: `docs/submission-requirements.md`
- Modify: `sessions/session-11.md`
- Test only if required by an accepted functional finding.

**Interfaces:**

- Consumes: final candidate from Tasks 1–2 and `homework.pdf`.
- Produces: independent findings without conversation history and explicit project verdicts.

- [x] **Step 1: Dispatch the clean reviewer**

Create one reviewer agent with `fork_turns="none"` and this complete task:

```text
Audit /Users/alphis/Desktop/PROJECTS/TestTask against /Users/alphis/Desktop/PROJECTS/TestTask/homework.pdf. Focus on the mandatory cycle, "Что сдавать", Frontend minimum requirements/pages 9–10, evaluation criteria, and page 22 checklist. Inspect the repository and run read-only checks, but modify nothing. Do not trust README claims unless evidence exists. Return: (1) blocking findings ordered by severity with exact file paths/evidence, (2) requirements that are demonstrably satisfied, (3) items impossible to verify, and (4) final submission-readiness verdict. You have no conversation history; treat the repository as a fresh review.
```

- [x] **Step 2: Preserve the report and decide every finding**

Create `docs/independent-audit.md` with:

- date, reviewer model, audited commit, and read-only scope;
- the reviewer's readiness verdict verbatim;
- a numbered list preserving every finding verbatim;
- a decision table with columns `№`, `Серьёзность`, `Решение`, `Обоснование/доказательство`;
- satisfied and unverifiable requirements from the reviewer;
- a final section that distinguishes fixed current defects from historical gaps.

Use `принято`, `исправлено`, or `отклонено`; no finding may disappear.

- [x] **Step 3: Handle accepted findings minimally**

For documentation/evidence findings, update the named document and matrix row directly. For a functional behavior finding, first write the smallest failing test, run it to verify the expected failure, implement one minimal root-cause fix, and rerun the focused and full suites. Do not implement unrelated suggestions.

- [x] **Step 4: Commit the independent audit**

Run formatting and diff checks, then:

```bash
git add docs/independent-audit.md docs/submission-requirements.md sessions/session-11.md
git add README.md AGENTS.md SPEC.md apps packages screenshots
git commit -m "docs: record independent homework audit"
```

The second `git add` includes only files genuinely changed by accepted findings; a clean path is a no-op.

---

### Task 4: Finalize, push, and verify from the public clone

**Files:**

- Modify: `README.md`
- Modify: `docs/submission-requirements.md`
- Modify: `docs/superpowers/plans/2026-08-14-homework-compliance.md`
- Modify: `sessions/session-11.md`
- Modify: `sessions/STATE.md`

**Interfaces:**

- Consumes: candidate commits, audit verdict, local verification, and public GitHub access.
- Produces: final truthful submission and clean-clone evidence.

- [ ] **Step 1: Scan tracked files for likely secrets**

Run:

```bash
git grep -Il -E '(sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{20,}|BEGIN (RSA |OPENSSH )?PRIVATE KEY)' -- . || true
git ls-files | rg '(^|/)(\.env|id_rsa|id_ed25519)(\.|$)' || true
```

Expected: both commands produce no file paths. Mark the secrets row `закрыто` only after this output.

- [ ] **Step 2: Run final local verification**

Run fresh:

```bash
pnpm build
pnpm test
pnpm lint
pnpm format:check
pnpm --filter @taskflow/dashboard exec playwright test
git diff --check
```

Expected: repository gate exits `0`, 33 unit/component tests and 6 Playwright tests pass, and only the known Vite chunk warning remains.

- [ ] **Step 3: Close the live documents**

Mark every plan checkbox complete. Set session 11 to `завершена`; record PDF pages reviewed, accepted/rejected audit findings, exact command counts, screenshot inspection, known warning, and remaining historical gaps. Update `sessions/STATE.md` to session 11 with no active functional work and the submission documents/evidence in completed work.

Run Prettier, the Part I checksum, `git diff --check`, and inspect the complete diff from `origin/main`.

- [ ] **Step 4: Commit and push the candidate**

```bash
git add README.md AGENTS.md SPEC.md docs screenshots sessions/STATE.md sessions/session-11.md apps/dashboard/e2e/board.spec.ts
git commit -m "docs: finalize homework submission"
git push origin main
```

Expected: push succeeds without force.

- [ ] **Step 5: Clone publicly and execute the README path**

Create an exact temporary directory with `mktemp -d`, clone without embedding credentials, and run:

```bash
SUBMISSION_CLONE_ROOT=$(mktemp -d /private/tmp/taskflow-submission.XXXXXX)
git clone https://github.com/kaydo228/taskmanager.git "$SUBMISSION_CLONE_ROOT/taskmanager"
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm lint
pnpm format:check
```

Run the pnpm commands from `$SUBMISSION_CLONE_ROOT/taskmanager`. Expected: clone and all commands exit `0`. Record the cloned commit SHA and outputs summary. Remove only the exact directory stored in `$SUBMISSION_CLONE_ROOT` after validating that it starts with `/private/tmp/taskflow-submission.`.

- [ ] **Step 6: Record clean-clone proof and push the final documentation commit**

Mark the README/clean-clone and external repository matrix rows `закрыто`. Add the public clone result to session 11, then:

```bash
pnpm exec prettier --write README.md docs/submission-requirements.md sessions/session-11.md
pnpm format:check
git diff --check
git add README.md docs/submission-requirements.md sessions/session-11.md
git commit -m "docs: record public clone verification"
git push origin main
git status --short --branch
git rev-parse HEAD
git rev-parse origin/main
```

Expected: clean `main...origin/main` and identical SHAs.

- [ ] **Step 7: Remove PDF review intermediates**

Verify `tmp/pdfs/session-11` contains only the rendered/extracted artifacts created during this session, then remove exactly that directory. Confirm `tmp/` no longer appears in `git status`.
