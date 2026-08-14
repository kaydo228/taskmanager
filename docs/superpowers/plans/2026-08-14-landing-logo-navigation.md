# Landing Logo Navigation Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Make the dashboard logo open the locally running landing page immediately and allow deployments to override that URL.

**Architecture:** Keep the cross-application navigation as a normal anchor. Define the URL beside `BoardPage` from Vite's `VITE_LANDING_URL`, with `http://localhost:3001` as the fallback that matches the landing package's dev script.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, Next.js landing application.

## Global Constraints

- Work directly in `main`, as explicitly requested by the user, and push only after verification.
- Add no dependency and do not change React Router, localStorage, or application routes.
- Keep the landing and dashboard as separate applications connected by a normal document navigation.
- Follow RED → GREEN: observe the regression test fail on port `3000` before changing production code.

---

### Task 1: Correct the dashboard brand destination

**Files:**

- Modify: `apps/dashboard/src/pages/board-page.test.tsx`
- Modify: `apps/dashboard/src/pages/board-page.tsx`

**Interfaces:**

- Consumes: optional Vite build variable `import.meta.env.VITE_LANDING_URL`.
- Produces: `landingUrl: string` and a `taskflow.` brand anchor whose `href` uses it.

- [x] **Step 1: Add the failing behavior assertion**

Add this assertion immediately after `render(<BoardPage />)` in the existing test:

```tsx
expect(screen.getByRole('link', { name: 'taskflow.' })).toHaveAttribute(
  'href',
  'http://localhost:3001',
);
```

This catches a brand destination that disagrees with the landing application's configured local port.

- [x] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm --filter @taskflow/dashboard test -- src/pages/board-page.test.tsx
```

Expected: FAIL because the received `href` is `http://localhost:3000`.

- [x] **Step 3: Implement the minimal configurable URL**

Add beside the imports in `board-page.tsx`:

```ts
export const landingUrl =
  import.meta.env.VITE_LANDING_URL ?? 'http://localhost:3001';
```

Then change only the brand anchor:

```tsx
<a className="dashboard-page__brand" href={landingUrl}>
```

- [x] **Step 4: Run focused and dashboard tests and verify GREEN**

Run:

```bash
pnpm --filter @taskflow/dashboard test -- src/pages/board-page.test.tsx
pnpm --filter @taskflow/dashboard test
```

Expected: the focused test and all dashboard tests PASS.

- [x] **Step 5: Commit the behavior fix**

```bash
git add apps/dashboard/src/pages/board-page.tsx apps/dashboard/src/pages/board-page.test.tsx
git commit -m "fix: correct landing logo navigation"
```

---

### Task 2: Verify navigation and close the session

**Files:**

- Modify: `sessions/session-10.md`
- Modify: `sessions/STATE.md`
- Modify: `docs/superpowers/plans/2026-08-14-landing-logo-navigation.md`

**Interfaces:**

- Consumes: the corrected brand link and the two dev servers started by `pnpm dev`.
- Produces: browser evidence, required command evidence, and a truthful completed session record.

- [x] **Step 1: Verify the real cross-application navigation**

Run `pnpm dev`, open `http://127.0.0.1:5173/board`, click the `taskflow.` logo, and verify the final URL is `http://localhost:3001/` and the landing heading is visible. Check the browser console for errors.

- [x] **Step 2: Run the repository gate**

Run separately:

```bash
pnpm build
pnpm test
pnpm lint
pnpm format:check
```

Expected: all commands exit `0`; record the existing Vite bundle-size warning if it remains.

- [x] **Step 3: Update documentation and review the diff**

Set session 10 to `завершена`, record RED/GREEN and browser evidence, and update `sessions/STATE.md` with the configurable landing URL. Mark every plan checkbox complete, then run:

```bash
git diff --check
git status --short --branch
```

Expected: no whitespace errors and only the approved navigation fix, tests, plan, and session documentation differ from the last pushed `main`.

- [x] **Step 4: Commit and push the completed session**

```bash
git add docs/superpowers/plans/2026-08-14-landing-logo-navigation.md sessions/session-10.md sessions/STATE.md
git commit -m "docs: close landing navigation session"
git push origin main
```

Expected: local `HEAD` and `origin/main` resolve to the same commit.
