import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "../test-stylesheet";
import { Variant } from "../types";
import { Arrow } from "./arrow";

/**
 * What separates one surface from the one behind it, on THIS palette.
 *
 * `.card`, `.card-overlay` and `.card-transparent` distinguish themselves from their
 * ground by background lightness and a drop shadow — no border, no outline. Whether
 * that reads is a property of the palette's steps rather than of the approach, so it
 * is measured here instead of judged on a screen.
 *
 * WCAG 1.4.11 puts non-text contrast for the visual information needed to identify a
 * UI component at 3:1, and a floating surface's edge is that information: it is what
 * says where the menu stops and the page resumes. **No pair in this file reaches it,
 * and the border these surfaces used to carry did not reach it either** — that colour
 * ran 1.61:1 to 2.34:1. So the bar is not something one edit moved past; the whole
 * `--card-border-color` / `layout-*` ramp sits below it, and closing the gap means
 * changing the ramp, not restoring an outline.
 *
 * THE REAL STYLESHEET IS LOADED DELIBERATELY. Without it every class is inert, all
 * surfaces compute to the same transparent default, and the assertions can only agree
 * with themselves — a flat 1.000 everywhere would read as a finding when it is really
 * an empty test. `resolve to distinct backgrounds` fails first in that case, which is
 * what lets the rest be read as measurements.
 *
 * THE CONTROL IS THE BOUNDARY THAT WAS REMOVED. `--card-border-color` still resolves
 * per variant, so it can be measured against the same pairs even though nothing paints
 * it any more. It beats the background delta everywhere, which is what makes "the cue
 * was removed rather than replaced" a measurement rather than an opinion.
 */

const canvas = document.createElement("canvas");
canvas.width = canvas.height = 1;
const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

/**
 * Paint `color` over `ground` and read the result as sRGB bytes.
 *
 * Compositing rather than parsing is what makes a translucent surface measurable:
 * `.card-transparent` is 90% of a token over whatever is behind it, so its effective
 * colour is a property of the pair. An opaque `color` ignores the ground, so one
 * function covers both, and both arrive here as whatever syntax the engine chose —
 * `oklch(...)`, `oklab(... / 0.9)`, `rgb(...)`.
 *
 * `fillStyle` is reset to a known value before each assignment: the canvas silently
 * KEEPS the previous value when handed something it cannot parse, so without the reset
 * a colour syntax the engine rejects would measure as whatever was drawn last.
 */
function composite(color: string, ground: string): [number, number, number] {
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "#000";
  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = "#000";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2]];
}

/** Re-serialise composited bytes so a measured surface can itself act as a ground. */
const asCss = ([r, g, b]: [number, number, number]) => `rgb(${r}, ${g}, ${b})`;

const channel = (c: number) =>
  c / 255 <= 0.04045 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4;
const luminance = ([r, g, b]: [number, number, number]) =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

/** WCAG contrast between two already-composited colours. */
function ratio(a: [number, number, number], b: [number, number, number]): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

type Theme = "light" | "dark";

/**
 * Mount `className` under a theme and read what it paints.
 *
 * `variant-scope` is added because every floating surface carries it and it is where the
 * variant custom properties are declared — `--card-border-color` among them. A probe
 * without it resolves those to the initial value and measures pure black, which looks
 * like a plausible colour rather than like a missing one.
 *
 * Attached to `document.body` because a detached node has no computed style: every
 * property comes back as the initial value, and for `background-color` that is the
 * same transparent black an unloaded stylesheet gives.
 */
function paintOf(theme: Theme, className: string) {
  const host = document.createElement("div");
  if (theme === "dark") host.className = "dark";
  const element = document.createElement("div");
  element.className = `variant-scope ${className}`;
  host.appendChild(element);
  document.body.appendChild(host);
  try {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      shadow: style.boxShadow,
      border: { color: style.borderColor, width: style.borderWidth, style: style.borderStyle },
      outline: { color: style.outlineColor, width: style.outlineWidth, style: style.outlineStyle },
    };
  } finally {
    host.remove();
  }
}

type Paint = ReturnType<typeof paintOf>;

/**
 * The contrast of whatever currently identifies the surface's edge against `ground`.
 *
 * A painted border or outline IS the edge, and it hides the background behind it — so
 * measuring the background while one is present would report a boundary the eye never
 * sees. Reading the cue that is actually painted is also what makes the ceiling below
 * sensitive to a border coming back: a test that only ever read `background-color`
 * would stay green through the very change it claims to guard.
 *
 * Both properties have to agree before a cue counts, because each has a default that
 * looks like a painted edge on its own: Tailwind's preflight sets `border-style: solid`
 * on every element while leaving the width at 0, and `outline-width` computes to 3px
 * from the initial `medium` while the style stays `none`. Width alone or style alone
 * would report an edge on every surface in the package.
 */
function edgeContrast(paint: Paint, ground: string): number {
  const plain = composite(ground, "#000");
  for (const cue of [paint.border, paint.outline]) {
    if (cue.style !== "none" && parseFloat(cue.width) > 0) {
      return ratio(composite(cue.color, "#000"), plain);
    }
  }
  return ratio(composite(paint.background, ground), plain);
}

/** Resolve a custom property to a colour, letting the engine do the substitution. */
function tokenOf(theme: Theme, token: string): string {
  const host = document.createElement("div");
  if (theme === "dark") host.className = "dark";
  const element = document.createElement("div");
  element.className = "variant-scope";
  element.style.color = `var(${token})`;
  host.appendChild(element);
  document.body.appendChild(host);
  try {
    return getComputedStyle(element).color;
  } finally {
    host.remove();
  }
}

const THEMES: Theme[] = ["light", "dark"];

/**
 * The scrim `Modal`, `Dialog` and `SidebarModal` paint behind themselves — the compiled
 * form of the `bg-black/40` all three carry.
 */
const SCRIM = "rgba(0, 0, 0, 0.4)";

/**
 * The grounds a floating surface lands on.
 *
 * `layout-*-base` is the app frame, resolved from the token rather than spelled, so a
 * change to the ramp reaches this file. That matters more here than it looks: every
 * assertion below is a CEILING, so a ground that drifted to a wrong value would leave
 * the suite green while measuring the wrong pair.
 *
 * `.card-panel` cannot be resolved the same way. It is declared in each consuming app's
 * own stylesheet rather than in this package, with the same two literals in both
 * (`apps/studio/src/index.css` and `apps/vizij-app/src/index.css`), so there is no token
 * here to read. It is spelled out and named as a copy for that reason.
 */
const GROUND: Record<Theme, { name: string; color: string }[]> = {
  light: [
    { name: "layout-light-base", color: tokenOf("light", "--color-layout-light-base") },
    { name: "card-panel", color: "#dcdcdc" },
  ],
  dark: [
    { name: "layout-dark-base", color: tokenOf("dark", "--color-layout-dark-base") },
    { name: "card-panel", color: "#252525" },
  ],
};

// The token lookups above run at module scope, so a renamed or deleted `layout-*-base`
// would resolve to the initial `color` and silently measure black. Named here rather
// than left to a ceiling that would happily pass against it.
for (const theme of ["light", "dark"] as const) {
  if (GROUND[theme][0].color === "rgb(0, 0, 0)") {
    throw new Error(`--color-layout-${theme}-base did not resolve`);
  }
}

const FLOATING = ["card", "card-overlay", "card-transparent"];

/** WCAG 1.4.11 non-text contrast, for the boundary that identifies a component. */
const BOUNDARY_BAR = 3;

/**
 * The band the background-only boundaries currently sit in — measured 1.013:1 (dark
 * `.card` on `.card-panel`) to 1.419:1 (dark `.card-overlay` on `layout-dark-base`).
 *
 * Asserted as a ceiling rather than a floor because a floor at 3 would assert something
 * the product does not do. `edgeContrast` reads the cue that is actually painted, so
 * restoring a border or outline reddens this rather than slipping past a test that only
 * ever looked at `background-color`; the response is to raise the bound deliberately at
 * the moment the claim changes, rather than to leave a number that has quietly stopped
 * describing what ships.
 */
const SEPARATION_CEILING = 1.5;

// Control for the measurement itself: black against white is 21:1 by definition, so a
// broken colour parse surfaces here rather than as a plausible wrong number below.
test("the contrast measurement reproduces a known value", () => {
  expect(ratio(composite("oklch(0 0 0)", "#fff"), composite("oklch(1 0 0)", "#fff"))).toBeCloseTo(
    21,
    1,
  );
});

// Control for the stylesheet: with it inert every class computes `rgba(0, 0, 0, 0)` and
// every ratio below is exactly 1. This fails first in that case, which is what lets the
// numbers below be read as measurements rather than as a default agreeing with itself.
test.each(THEMES)("%s: the card classes resolve to distinct backgrounds", (theme) => {
  const card = paintOf(theme, "card").background;
  const overlay = paintOf(theme, "card-overlay").background;
  expect(card, "`.card` background did not resolve").not.toBe("rgba(0, 0, 0, 0)");
  expect(overlay, "`.card-overlay` background did not resolve").not.toBe("rgba(0, 0, 0, 0)");
  expect(overlay, "`.card-overlay` is indistinguishable from `.card`").not.toBe(card);
});

test.each(THEMES)("%s: no surface boundary reaches the 3:1 bar", (theme) => {
  const card = composite(paintOf(theme, "card").background, "#000");
  const grounds = [...GROUND[theme], { name: ".card", color: asCss(card) }];

  for (const ground of grounds) {
    for (const className of FLOATING) {
      const paint = paintOf(theme, className);
      // States the premise the number rests on. Without it a restored border would be
      // measured correctly by `edgeContrast` and still leave the reader thinking the
      // figure describes a background delta. Asserted on width, not style: preflight
      // leaves `border-style: solid` on everything, so style says nothing here.
      expect(parseFloat(paint.border.width), `.${className} paints a border`).toBe(0);
      expect(paint.outline.style, `.${className} paints an outline`).toBe("none");

      const measured = edgeContrast(paint, ground.color);
      expect(
        measured,
        `${theme}: .${className} against ${ground.name} measured ${measured.toFixed(3)}:1`,
      ).toBeLessThan(SEPARATION_CEILING);
    }
  }
});

/**
 * The one arrangement that clears the bar, and the theme in which it does not.
 *
 * `Modal` and `Dialog` stay on `.card` and are not measured against the page:
 * `bg-black/40` is painted between, and in light mode that scrim moves the ground far
 * enough from `.card` to carry the boundary on its own. It is the only arrangement in
 * the package where losing the border cost nothing.
 *
 * Only in light mode. Darkening a dark ground moves it TOWARD `.card`'s dark fill
 * rather than away from it, so the same scrim that lifts the light modal to 3.408:1
 * drops the dark one to 1.089:1 — the scrim and the surface converge. This is the shape
 * of the whole problem in one pair: the ramp has room to darken in light mode and none
 * in dark.
 *
 * `SidebarModal` is deliberately NOT covered by this. It carries `.card` too, but
 * overrides the fill on desktop to `layout-*-base/90`, which is a different colour over
 * the same scrim and lands below the bar in both themes. Measuring `.card` and naming
 * `SidebarModal` would report a boundary it does not have on the breakpoint where most
 * of its use is.
 */
test.each(THEMES)("%s: a modal's scrim carries the boundary only in light mode", (theme) => {
  const scrim = asCss(composite(SCRIM, GROUND[theme][0].color));
  const measured = edgeContrast(paintOf(theme, "card"), scrim);
  const message = `${theme}: .card against a dimmed ${GROUND[theme][0].name} measured ${measured.toFixed(3)}:1`;

  if (theme === "light") {
    expect(measured, message).toBeGreaterThanOrEqual(BOUNDARY_BAR);
  } else {
    expect(measured, message).toBeLessThan(SEPARATION_CEILING);
  }
});

/**
 * The fill `SidebarModal` actually paints on desktop, against the same scrim.
 *
 * It is the closest thing in the package to a boundary that works and still does not
 * reach the bar, which is why it is measured rather than left to the modal case above.
 */
test.each(THEMES)("%s: SidebarModal's desktop fill stays below the bar", (theme) => {
  const scrim = asCss(composite(SCRIM, GROUND[theme][0].color));
  const fill = theme === "dark" ? "bg-layout-dark-base/90" : "bg-layout-light-base/90";
  const measured = edgeContrast(paintOf(theme, fill), scrim);
  expect(
    measured,
    `${theme}: SidebarModal's ${fill} against a dimmed ground measured ${measured.toFixed(3)}:1`,
  ).toBeLessThan(BOUNDARY_BAR);
});

/**
 * The control: the boundary these surfaces used to carry.
 *
 * `.card` painted a 2px border in `--card-border-color` and `.card-transparent` a 2px
 * outline in the same colour — `default-400` in light, `default-600` in dark. It beats
 * the background delta on every pair, so the edge that went away was carrying the
 * boundary and nothing in the new form takes it over.
 *
 * It is also asserted to sit BELOW the bar, which is the half that stops this reading
 * as a case for putting the border back: on this palette the border was 1.61:1 to
 * 2.34:1, so neither form meets 1.4.11 and only a change to the ramp would.
 */
test.each(THEMES)(
  "%s: the removed border beat the background delta, and still missed the bar",
  (theme) => {
    const border = composite(tokenOf(theme, "--card-border-color"), "#000");
    expect(border, "`--card-border-color` did not resolve").not.toEqual([0, 0, 0]);

    for (const ground of GROUND[theme]) {
      const plain = composite(ground.color, "#000");
      const withBorder = ratio(border, plain);

      for (const className of FLOATING) {
        const withBackground = edgeContrast(paintOf(theme, className), ground.color);
        expect(
          withBorder,
          `${theme}: on ${ground.name}, border ${withBorder.toFixed(3)}:1 vs ` +
            `.${className} background ${withBackground.toFixed(3)}:1`,
        ).toBeGreaterThan(withBackground);
      }

      expect(
        withBorder,
        `${theme}: --card-border-color against ${ground.name} measured ${withBorder.toFixed(3)}:1`,
      ).toBeLessThan(BOUNDARY_BAR);
    }
  },
);

/**
 * What the shadow is worth, and where it is worth nothing.
 *
 * The shadow is the only boundary cue left, and it is directional: both painting layers
 * are offset DOWNWARD (y = 10px and y = 4px), so the darkening falls below and beside
 * the surface and the top edge gets none of it. A dropdown opening below its trigger
 * and a tooltip sitting above one both present a top edge separated by background
 * lightness alone, which is the figure measured above.
 *
 * The peak is measured by compositing the shadow's own colour directly over the ground:
 * that is the most it can be worth at any pixel, since blur only spreads it thinner. A
 * peak below the bar means no part of the edge reaches the bar.
 *
 * Tailwind emits four fully transparent layers ahead of the two that paint — the ring
 * and inset slots the shadow utility reserves. They are skipped by alpha rather than by
 * position: reading the first layer instead measures `rgba(0, 0, 0, 0)`, which scores a
 * flat 1.000:1 and looks like a finding about the design.
 */
test.each(THEMES)("%s: the shadow is offset downward and its peak is below the bar", (theme) => {
  const { shadow } = paintOf(theme, "card-overlay");
  expect(shadow, "`.card-overlay` has no shadow to carry the boundary").not.toBe("none");

  const layers = [...shadow.matchAll(/(rgba?\([^)]*\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px/g)]
    .map((m) => ({ color: m[1], y: Number(m[3]) }))
    .filter((layer) => !/,\s*0\s*\)$/.test(layer.color));
  expect(layers.length, `no painting layer parsed from ${shadow}`).toBeGreaterThan(0);

  for (const layer of layers) {
    expect(layer.y, `a shadow layer at y=${layer.y} would darken the top edge`).toBeGreaterThan(0);
  }

  for (const ground of GROUND[theme]) {
    const plain = composite(ground.color, "#000");
    const peak = Math.max(
      ...layers.map((layer) => ratio(composite(layer.color, ground.color), plain)),
    );
    expect(
      peak,
      `${theme}: shadow peak against ${ground.name} measured ${peak.toFixed(3)}:1`,
    ).toBeLessThan(BOUNDARY_BAR);
  }
});

/**
 * The arrow paints its surface's colour exactly, which is what lets it have no seam.
 *
 * It carries no mask across its mouth, and needs none while no surface draws an edge
 * there: a mask exists to hide a border crossing the join, so a surface that gains one
 * has to bring the mask back with it. What is left is the whole requirement — the arrow
 * agrees with the surface it hangs off, `.card-overlay` when unfilled and `.card-invert`
 * when filled — and it is asserted as equality rather than as a contrast bound, because
 * anything short of an exact match shows up as a visible step at the join.
 *
 * Both branches are covered in both themes because they take their fill from different
 * places — a literal `layout-*-deep-inset` pair and a `--strong-accent-text-color`
 * derivation — and only one of them tracks the theme by the same mechanism the surface
 * does.
 */
test.each(THEMES)("%s: the arrow fill matches the surface it hangs off", async (theme) => {
  for (const [filled, className] of [
    [false, "card-overlay"],
    [true, "card-invert"],
  ] as const) {
    const host = document.createElement("div");
    if (theme === "dark") host.className = "dark";
    document.body.appendChild(host);
    try {
      const view = render(<Arrow filled={filled} variant={Variant.Default} />, { container: host });
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

      const path = host.querySelector("path")!;
      expect(getComputedStyle(path).fill, `${theme}: arrow filled=${filled}`).toBe(
        paintOf(theme, className).background,
      );
      view.unmount();
    } finally {
      host.remove();
    }
  }
});
