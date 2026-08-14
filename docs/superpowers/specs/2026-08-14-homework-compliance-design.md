# Homework Compliance Completion Design

## Goal

Bring the Taskflow repository as close as honestly possible to the mandatory and frontend-specific requirements in `homework.pdf`, without rewriting historical journals or fabricating artifacts that were not produced at the required time.

## Existing Evidence

The repository already contains a working Turborepo, a completed `SPEC.md`, project-specific rules in Part II of `AGENTS.md`, 11 live session files, unit/component/e2e tests, responsive screenshots, localStorage validation, and a public GitHub remote. The product exposes empty, populated, validation-error, drag, and modal states, with keyboard alternatives and reduced-motion handling.

## Documentation Changes

### README

Replace the course starter text with a Russian project README that contains:

- project purpose and why the mini task board was selected;
- tested prerequisites and exact clean-start commands;
- landing and dashboard URLs and optional deployment URL variables;
- implemented user flows and interface states;
- architecture and storage contract;
- verification commands and links to evidence;
- assumptions, deliberate exclusions, known limitations, and submission status;
- the public repository URL.

### Project Rules

Change only Part II of `AGENTS.md`:

- name the landing and dashboard ports explicitly;
- name the three required states and how each is reached;
- require a question before changing visual design during a logic fix;
- preserve the existing prohibition on deleting screenshots and demo snapshots.

Part I remains byte-for-byte unchanged.

### Requirements Matrix

Create `docs/submission-requirements.md` with one row per mandatory, frontend, and final-checklist requirement. Every row has a status (`закрыто`, `частично`, or `отсутствует`), direct repository evidence, and a short note. The matrix does not turn missing history into a passing item.

Update only the completion marks in `SPEC.md` after current acceptance evidence confirms each criterion; do not rewrite requirement wording.

## Fresh Acceptance Evidence

Run the full repository gate and all Playwright tests. In a real browser verify empty, populated, and validation-error states, malformed localStorage recovery, reload persistence, console output, and Tab/Enter/Space/Esc. Save current board screenshots at 360x800 and 1440x900 as `screenshots/submission-board-360.png` and `screenshots/submission-board-1440.png`.

After the final documentation commit and push, clone the public repository into a temporary directory and follow the README from scratch: install with the frozen lockfile and run the documented verification commands. Record actual results, not command promises.

## Independent Audit

Dispatch a reviewer agent with no conversation history. It receives only `homework.pdf`, the repository path, and the instruction to audit the final candidate against the mandatory and frontend requirements. The reviewer does not modify files. Preserve its findings in `docs/independent-audit.md`; for each finding record the reviewer text, severity, and project decision (`принято`, `исправлено`, or `отклонено`) with evidence.

If the audit finds a direct functional criterion failure, add a failing regression test before the smallest production fix. Scope expansions and unrelated improvements remain documented rather than implemented.

## Historical Gaps

The following cannot be honestly recreated as if they had happened earlier:

- the naive run required before the specification;
- a matching design screenshot from before the visual improvement;
- the unused placeholder in `sessions/session-1.md`.

Do not modify `session-1.md`, old screenshots, or past session verdicts. README and the requirements matrix state these limitations explicitly. A retrospective mock-up or reconstructed journal would be worse evidence than an honest missing item.

## Completion Criteria

- README starts the project without unstated steps.
- Part I of `AGENTS.md` is unchanged; Part II names the required runtime behavior.
- The matrix maps every relevant PDF requirement to evidence or an honest gap.
- Fresh screenshots, browser acceptance, tests, and an independent audit are committed.
- The public repository can be cloned without authentication and the README verification succeeds from the clone.
- `main` and `origin/main` resolve to the same final commit with a clean working tree.
