# Landing Logo Navigation Fix Design

## Problem

Dashboard renders its brand link with `href="http://localhost:3000"`, while the landing application starts with `next dev --port 3001`. Clicking the logo therefore navigates to an unused port and waits for a server that is not part of this project.

## Decision

Expose one dashboard-side URL constant:

```ts
export const landingUrl =
  import.meta.env.VITE_LANDING_URL ?? 'http://localhost:3001';
```

The dashboard brand remains a normal anchor and receives `landingUrl` as its `href`. A normal document navigation is intentional because landing and dashboard are separate applications; React Router must not handle this link.

## Configuration

- Local development needs no environment file: the fallback matches the landing package's fixed port `3001`.
- A deployed dashboard may set `VITE_LANDING_URL` to its public landing origin.
- No dependency, route, localStorage contract, or server is added.

## Verification

- Add a component regression test that renders `BoardPage` and asserts the `taskflow.` brand links to `http://localhost:3001` when no environment override is present.
- Observe the new test fail against the current hard-coded port `3000`, then implement the constant and observe it pass.
- Run the dashboard suite and the repository-required build, test, lint, and formatting commands.
- Start both applications, click the dashboard logo in Chromium, and verify navigation reaches the landing page without console errors.

## Scope

Only the dashboard-to-landing brand link is changed. Landing-to-dashboard links and deployment configuration files are outside this fix because their current behavior is unrelated to the reported failure.
