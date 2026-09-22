import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

/**
 * Guards the variant context root class's name: `variant-scope`, never the bare
 * word `responsive`.
 *
 * `responsive` still appears correctly throughout this codebase — the
 * `variant-responsive-*` / `variant-static-*` treatment axis, `.responsive-accent-bg`,
 * `@vizx/responsive`, and ordinary prose about breakpoints or perceived latency — so
 * this matches the bare, hyphen-free token only (`(?<![-\w])responsive(?![-\w])`),
 * which is what a class name or a CSS selector looks like and what a treatment
 * name or a sentence does not.
 *
 * The remaining bare-word matches are prose about responsiveness in the ordinary
 * sense (a breakpoint, a container query, how quickly something reacts), not the
 * class. They are named here by an exact substring rather than excluded by file, so
 * an unrelated edit to the same file does not silently widen the allowance, and a
 * new bare `responsive` class added anywhere else still reddens this test.
 */

const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));
const STYLES_PATH = "packages/ui/public/styles.css";
const SOURCE_DIRS = ["packages/ui/src", "apps/studio/src"];
// This file's own prose about the token it guards would otherwise flag itself.
const SELF = fileURLToPath(import.meta.url);

const BARE_TOKEN = /(?<![-\w])responsive(?![-\w])/;

const KNOWN_PROSE = [
  // floating/modal.tsx — the modal's own layout responds to viewport width, not the variant root.
  "Includes automatic scroll handling, responsive",
  // floating/sidebar-modal.tsx — the collapse/expand width transition reacts to state, not the class.
  "descendant `data-expanded` selectors and the responsive",
  // floating/tooltip-3d/use-tooltip-trigger.ts — the tooltip hides promptly; no class involved.
  "Immediate hide for responsive feel",
  // layouts/card-grid.tsx — the measured column count follows Tailwind's own breakpoint classes.
  "responsive classes, so the number in effect depends",
  // list/list-grid-virtual.browser.tsx — a `hideBelow` container query, not the variant root.
  "The floors and the responsive-hiding container query",
  // list/list-row.tsx — a `@max-*:hidden` container query for column hiding at a breakpoint.
  "a container-query `@max-*:hidden` for responsive",
  // studio/.../listing-card-grid.tsx — the `grid-cols` track ladder, a Tailwind breakpoint concern.
  "the selection contract and the responsive",
  // studio/.../use-project-asset-sharing.test.tsx — quoting a hypothetical change description.
  'a "make the delete feel responsive" change',
];

function sourceFiles(dir: string): string[] {
  return readdirSync(join(REPO_ROOT, dir), { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name))
    .map((entry) => join(entry.parentPath ?? entry.path, entry.name))
    .filter((file) => file !== SELF);
}

/** Every line carrying a bare `responsive` token this test does not already know about. */
function violations(file: string): string[] {
  const text = readFileSync(file, "utf8");
  return text
    .split("\n")
    .map((line, i) => ({ line, number: i + 1 }))
    .filter(({ line }) => BARE_TOKEN.test(line))
    .filter(({ line }) => !KNOWN_PROSE.some((prose) => line.includes(prose)))
    .map(({ line, number }) => `${file}:${number}: ${line.trim()}`);
}

describe("the variant context root class is named variant-scope, never responsive", () => {
  test("public/styles.css declares no bare `.responsive` selector", () => {
    const css = readFileSync(join(REPO_ROOT, STYLES_PATH), "utf8");
    const found = css
      .split("\n")
      .map((line, i) => ({ line, number: i + 1 }))
      .filter(({ line }) => BARE_TOKEN.test(line))
      .map(({ line, number }) => `${STYLES_PATH}:${number}: ${line.trim()}`);
    expect(found).toEqual([]);
  });

  for (const dir of SOURCE_DIRS) {
    test(`${dir} carries no bare \`responsive\` class outside the known prose`, () => {
      const found = sourceFiles(dir).flatMap((file) => violations(file));
      expect(found).toEqual([]);
    });
  }

  /**
   * ⚠ The control. Without it, an allowance list that had grown to swallow every real
   * site would report an empty `found` array for a reason unrelated to the rename
   * having happened — the same way an over-permissive regex or an empty directory
   * would. This pins that the treatment axis, which this test must NOT flag, is still
   * present in numbers, so the guard above is exercising real files.
   */
  test("the treatment axis this guard must leave alone is still present", () => {
    const css = readFileSync(join(REPO_ROOT, STYLES_PATH), "utf8");
    expect(css.match(/variant-responsive-[\w-]+/g)?.length ?? 0).toBeGreaterThan(5);
  });
});
