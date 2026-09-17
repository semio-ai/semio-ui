import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

/**
 * The three semio brand ramps, held equal across every app that declares them.
 *
 * Tailwind resolves its theme from the CSS entry it compiles, and the three apps have no
 * shared entry, so each one carries its own `@theme` block with the full primary /
 * secondary / tertiary ramps. `apps/studio/src/index.css` is the source of truth: 400 /
 * 500 / 600 are the brand triads and every other rung is interpolated along the ramp shape
 * of the family's nearest Tailwind palette, so regenerating a ramp is a derivation rather
 * than a taste call, and a rung edited in one copy alone is a divergence.
 *
 * ⚠ **A divergence here is silent in exactly the place it costs most.** Storybook is where
 * components are evaluated and vizij is a shipping surface; a ramp that drifts there paints
 * every review and every screenshot in colours the product does not use, and nothing about
 * the page looks wrong. Comparing the files is the only check that can see it — the apps
 * never load each other's CSS, so no rendering test can.
 *
 * This lives in `@semio/ui` because the package owns the design tokens the ramps feed, and
 * because its unit project runs on every CI build. It reads the app files directly; that
 * reach across the workspace IS the check.
 */

/** The repo root: three levels up from this file's own directory. */
const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

const SOURCE_OF_TRUTH = "apps/studio/src/index.css";
const COPIES = ["apps/docs/.storybook/styles.css", "apps/vizij-app/src/index.css"];

/**
 * Every literal brand colour a file declares, keyed by custom property.
 *
 * Matches lowercase hex literals only, and does not normalise what it reads. The
 * comparison is therefore on the text rather than on the colour, which is the stricter
 * and simpler of the two: an equivalent value spelled differently is still a copy that
 * cannot be diffed against its source, and it shows up here as a rung the matcher did not
 * find rather than as a silent pass.
 *
 * The `--color-info-*` aliases are `var(--color-tertiary-*)` and carry no value of their
 * own, so they are correctly absent — they cannot drift without the tertiary ramp drifting
 * first.
 */
function brandRamps(file: string): Map<string, string> {
  const css = readFileSync(join(REPO_ROOT, file), "utf8");
  const declaration = /^\s*(--color-(?:primary|secondary|tertiary)(?:-\d+)?):\s*(#[0-9a-f]{6});/gm;
  const ramps = new Map<string, string>();
  for (const [, property, value] of css.matchAll(declaration)) {
    ramps.set(property, value);
  }
  return ramps;
}

describe("the brand ramps agree across every app that declares them", () => {
  const source = brandRamps(SOURCE_OF_TRUTH);

  /**
   * ⚠ The control for every comparison below. A regex that stopped matching — a reformat,
   * a move, a rename — would make two empty maps compare equal and report a file that no
   * longer exists as being in perfect agreement. Pinning the count and one known value is
   * what separates "they match" from "nothing was read".
   */
  test(`${SOURCE_OF_TRUTH} declares the full three ramps`, () => {
    // Three families: a base plus eleven rungs each.
    expect(source.size).toBe(36);
    expect(source.get("--color-primary-500")).toBe("#f56b29");
  });

  test.each(COPIES)("%s matches the source of truth on every rung", (copy) => {
    const ramps = brandRamps(copy);
    expect(ramps.size).toBe(source.size);
    expect(Object.fromEntries(ramps)).toStrictEqual(Object.fromEntries(source));
  });

  /**
   * A ramp has to run light to dark without reversing, because a component picking two
   * rungs apart is relying on the order for its contrast. `tertiary` is the family where
   * that is worth pinning: 300 sitting lighter than 400 is invisible in isolation and only
   * shows as two adjacent swatches out of sequence.
   */
  test.each([SOURCE_OF_TRUTH, ...COPIES])("%s keeps tertiary monotonic at 300 → 400", (file) => {
    const ramps = brandRamps(file);
    const luminance = (hex: string) => {
      const channel = (from: number) => {
        const c = Number.parseInt(hex.slice(from, from + 2), 16) / 255;
        return c <= 0.040_45 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
    };
    expect(luminance(ramps.get("--color-tertiary-300")!)).toBeGreaterThan(
      luminance(ramps.get("--color-tertiary-400")!),
    );
  });
});
