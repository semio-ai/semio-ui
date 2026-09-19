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

/**
 * A `#rrggbb` literal's oklch lightness, 0–1.
 *
 * sRGB → linear → OKLab, whose `L` is the lightness axis the ramps are interpolated along.
 * Written out rather than taken from a colour library because the conversion is fixed and
 * short, and a test that reaches for a dependency the package does not declare resolves
 * through workspace hoisting — which works until it does not.
 */
function oklchLightness(hex: string): number {
  const linear = (offset: number) => {
    const channel = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.040_45 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = [linear(1), linear(3), linear(5)];
  const l = Math.cbrt(0.412_221_470_8 * r + 0.536_332_536_3 * g + 0.051_445_992_9 * b);
  const m = Math.cbrt(0.211_903_498_2 * r + 0.680_699_545_1 * g + 0.107_396_956_6 * b);
  const s = Math.cbrt(0.088_302_461_9 * r + 0.281_718_837_6 * g + 0.629_978_700_5 * b);
  return 0.210_454_255_3 * l + 0.793_617_785 * m - 0.004_072_046_8 * s;
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
   * ⚠ **Every rung of every family runs strictly darker than the one before it.**
   *
   * A rung number is a position in one family's ramp, and anything that picks two rungs
   * apart — a hover shade, a border against its fill — is relying on that order for its
   * separation. A pair out of sequence closes or inverts the gap wherever those two rungs
   * are used together, and it is invisible in isolation: a single swatch looks like a
   * perfectly good colour, and only the two side by side read as out of order.
   *
   * Asserted over the whole ramp rather than a named pair, so the family a future
   * regeneration reverses does not have to be the one anticipated here. Lightness is oklch
   * L, which is the axis the ramps are built along; WCAG relative luminance is a different
   * measure and can order two hues differently from the one the derivation used.
   */
  test.each([SOURCE_OF_TRUTH, ...COPIES])("%s keeps every ramp monotonic", (file) => {
    const ramps = brandRamps(file);

    for (const family of ["primary", "secondary", "tertiary"]) {
      const rungs = [...ramps]
        .flatMap(([property, hex]) => {
          const rung = new RegExp(`^--color-${family}-(\\d+)$`).exec(property);
          return rung ? [{ rung: Number(rung[1]), hex }] : [];
        })
        .sort((a, b) => a.rung - b.rung);

      // The control. A regex that stopped matching would leave an empty list, and a loop
      // over nothing reports a reversed ramp as being in perfect order.
      expect(rungs.map((r) => r.rung)).toStrictEqual([
        50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
      ]);

      for (let i = 1; i < rungs.length; i++) {
        const lighter = rungs[i - 1];
        const darker = rungs[i];
        expect({
          family,
          pair: `${lighter.rung} → ${darker.rung}`,
          ordered: oklchLightness(lighter.hex) > oklchLightness(darker.hex),
        }).toStrictEqual({
          family,
          pair: `${lighter.rung} → ${darker.rung}`,
          ordered: true,
        });
      }
    }
  });
});
