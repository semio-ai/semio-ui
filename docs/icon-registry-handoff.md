# Handoff: Icon System Initiative (SEM-159)

**For:** a coding agent working in a full terminal + Linear-integrated environment (e.g. Claude Code in the `semio_studio` repo).
**From:** a Cowork/Figma session that set up the Figma design-system pilot, authored the proposal, and created the Linear issues.
**Date:** 2026-06-12

---

## 1. Purpose

Drive the icon-system initiative to completion across code, and coordinate the Figma-side work with the Cowork/Figma session that owns the live Figma file. This doc gives you the context, the task graph, working conventions, how to handle common issues, and — importantly — **when to hand specific work back to the Cowork/Figma session** and what that session needs to resume.

## 2. Background (what already happened)

A Cowork/Figma session built a design-system pilot in the Figma file **"UI Library"** from `@semio/ui`:

- Token variable collections: **Primitives**, **Brand** (Default/Semio modes), **Color** (Light/Dark), **Typography** (a single `font-family` variable).
- A token-bound **Button** component set (8 variants × 5 sizes) with Label + icon component properties.
- While building the Button's icon slots, we hit the realization that the current icon handling is fragile — which produced the **icon-registry proposal** (`packages/ui/docs/icon-registry.md`).

That proposal is the spec you're implementing. The Linear epic and sub-issues below were created to track it.

## 3. Linear task graph

Project: **Studio Cleanup** · Team: **Semio AI (SEM)**

- **SEM-159** — *Icon system: context-based icon registry* (epic). Context + phases.
- **SEM-160** — *Icon registry — design doc & plan*. Deliverable = `packages/ui/docs/icon-registry.md` (already written; PR off `staging` pending). **Start here.**
- **SEM-161** — *Icon registry — implement in `@semio/ui`*. Blocked by SEM-160. The actual `IconProvider` / registry / `<Icon name>` / sizing work.
- **SEM-162** — *Icon registry — migrate consumers + Figma library/Code Connect*. Blocked by SEM-161. Consumer migration (code) **and** the Figma icon library + Code Connect (needs the Figma session — see §7).

Use the Linear MCP to move issues through states, add comments with progress, and link PRs. Keep each issue's status accurate (`In Progress` when you start, link the PR, `Done` on merge).

## 4. Repo & conventions

- Repo: `github.com/semio-ai/semio_studio` (monorepo: `packages/ui`, `packages/core`, `packages/animation`, `apps/studio`, …).
- **Base branch for PRs: `staging`** (not `main`). Current `staging` HEAD at handoff: `3d4cce4f`.
- Branch naming: use the Linear-suggested names so PRs auto-link, e.g. `andyschoen/sem-160-icon-registry-design-doc-plan`, `andyschoen/sem-161-…`, `andyschoen/sem-162-…`.
- One PR per sub-issue, each based off `staging`.
- Commit style observed in history: conventional-ish (`docs(ui): …`, `fix: …`). Match it.
- Tooling: `eslint` (max-warnings 0), `vitest` (`pnpm test` / `test:unit`), `tsup` build. Run lint + unit tests before pushing.

### SEM-160 — finish first (small)

The doc exists. Create the branch off `staging`, add `packages/ui/docs/icon-registry.md`, commit, push, open the PR against `staging`, and link it on SEM-160. (If the file isn't already in your tree, get it from the Cowork session's shared `icon-registry.md`.)

## 5. Implementation guidance — SEM-161 (`@semio/ui`)

Read `packages/ui/docs/icon-registry.md` first; it is the source of truth. Key files:

- `packages/ui/src/constants/icon.ts` — `ICON_CLASS_NAME = "icon-standard"`, `ICON_LG_CLASS_NAME = "icon-larger"`.
- `packages/ui/dist/styles.css` (compiled) — `.icon-standard { h-3/5 w-3/5 }` (60%), `.icon-larger { h-[70%] w-[70%] }`. Source is the Tailwind layer in `packages/ui/src`.
- `packages/ui/src/buttons/button.tsx`, `packages/ui/src/types.ts` (Variant/Size enums).
- `@tabler/icons-react` is already a dependency → default registry source.

Build:

1. `registry.ts` — `IconComponent`, `IconRegistry`, and a generated `defaultIconRegistry` keyed kebab-case from Tabler. Prefer a codegen step over a giant hand-written map (keeps tree-shaking honest).
2. `icon-provider.tsx` — context + `IconProvider` (with `extend` merge semantics).
3. `icon.tsx` — `<Icon name size>` resolving the key, applying `icon-standard`/`icon-larger` in one place, with a defined fallback for unknown names (decide: render nothing / dev-warn / CI-fail — see open questions in the doc).
4. Keep `Button` `leftIcon`/`rightIcon` working: accept `ReactNode` (legacy) during transition; optionally add `leftIconName`/`rightIconName` shorthands.
5. Tests (`vitest`): resolution, `extend` vs replace, fallback behavior, sizing class application.

Export new symbols from `src/index.tsx`. Update `packages/ui/docs` if the API drifts from the proposal.

## 6. Handling issues (general)

- **Lint/type/test failures:** fix before pushing; CI mirrors `eslint --max-warnings 0` and `vitest run`.
- **Merge conflicts with `staging`:** rebase the feature branch on `origin/staging`; re-run tests.
- **Scope creep:** if implementation reveals the proposal is wrong, comment on the relevant Linear issue and update `icon-registry.md` in the same PR rather than silently diverging.
- **Blocked dependency:** keep issues in the correct blocked/unblocked state; don't start SEM-162 code before SEM-161 lands.
- **CI / GitHub auth:** you have it locally; this is exactly the work the Cowork session could not do (it cannot write to `.git`, push, or run `gh`).

## 7. When to hand work BACK to the Cowork/Figma session

The Figma file is live and editable **only** through the Cowork/Figma session's Figma write connection. Bounce these back there:

- **SEM-162, Figma half:** building/naming the Figma **icon library** (component name == registry key), pointing component instance-swap slots (Button, etc.) at it, and verifying in the live file.
- **Code Connect that needs real Figma node URLs/names:** you can scaffold/generate the `*.figma.tsx` mapping files in code, but the **node IDs, the published library, and visual verification** come from the Figma session. Coordinate: agree the key list in code first, then the Figma session names components to match.
- **Any design-system changes** (new components, token edits, mode changes) — the Figma session owns canvas writes, screenshots, and brand/theme/font-mode verification.
- **Typography/Gilroy:** the Figma session must apply Gilroy in the editor (local-only font; automation can't load it).

A clean division: **code agent** finalizes registry keys + generates Code Connect skeletons; **Figma session** creates/renames the icon library and confirms the round-trip.

## 8. What the Cowork/Figma session needs to resume

When you hand back, provide (or confirm) the following so that session can pick up without re-discovery:

**Always re-establish:**
- The **Figma write connector must be re-authenticated** each session (OAuth via the Figma connector's Connect button). The server/tool ID is per-session and will differ.
- Figma file key: **`ExKZLlbGQ3lJxBddvR500j`** (file "UI Library").

**Current Figma state (as of this handoff):**
- Page **Brand** mode is set to **Semio**; **Color** mode default Light.
- The **`typography/font-family` variable is set to `Montserrat`** (a loadable stand-in). It was briefly set to `Gilroy` to confirm the swap, then reverted — because the automation environment **cannot load local fonts (Gilroy)**. Rule: keep it on a loadable family while the session builds text; the human flips it to `Gilroy` in the editor to review.
- Key node IDs (re-discoverable by name if they change): Button component set `7:50`; Icon placeholder component `23:2`; demo frame `27:2`. Collections by name: `Primitives`, `Brand`, `Color`, `Typography`.

**Decisions the Figma session needs from code:**
- The **final registry key list** (so Figma icon component names match exactly).
- The **naming contract** confirmation (kebab-case; optional `icon/` prefix stripped on read).
- Which icons to seed the Figma library with (recommend: the set actually used in `apps/studio`, then grow).

**Token/brand facts already encoded (for parity):**
- Variant → palette: primary=sky, secondary=violet, tertiary=pink, default=neutral, info=teal, success=green, warning=yellow, error=red.
- Semio brand overrides (Brand=Semio mode) for primary/secondary/tertiary/info only: orange `#f66416`, amber `#fba500`, teal `#3bc6b6` (+ info=teal); the rest stay Tailwind defaults. Source: `apps/studio/src/index.css`.
- Icon sizing rule: glyph = **60% of a square slot** the full control height (`icon-standard`).

## 9. Definition of done (per issue)

- **SEM-160:** doc PR merged to `staging`.
- **SEM-161:** `IconProvider`/registry/`<Icon>` shipped in `@semio/ui` with tests; `Button` icons routed through `<Icon>`; exported; PR merged.
- **SEM-162:** consumers migrated; Figma icon library published (names == keys); Code Connect generated and validated (instance-swap → `<Icon name>`); component slots pointed at the library; PR merged.

## 10. Pointers

- Proposal / spec: `packages/ui/docs/icon-registry.md`
- Brand overrides: `apps/studio/src/index.css`
- Gilroy fonts: `apps/studio/src/assets/fonts/Gilroy/`
- Linear: SEM-159 (epic), SEM-160, SEM-161, SEM-162
