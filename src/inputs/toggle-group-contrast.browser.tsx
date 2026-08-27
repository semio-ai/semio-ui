import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "../test-stylesheet";
import { Size, Variant } from "../types";
import { ToggleGroup } from "./toggle-group";

/**
 * What `--on-accent-color` is worth on THIS palette.
 *
 * The active label sits on a pill filled with `--accent-color`, and the token
 * derives its foreground from that fill with an oklch lightness threshold rather
 * than flipping with the theme. Whether that is an improvement is a property of
 * the palette, not of the token — so it is measured here rather than inherited
 * from the numbers quoted where the token was written.
 *
 * The real stylesheet is imported deliberately. Without it every class is inert,
 * both cases compute to the same default, and the assertions can only agree with
 * themselves. Every case below is paired with the theme-flipped colour the token
 * replaced, which is the control: where the two are equal the token changed
 * nothing, and a test with no such case would not be measuring the token at all.
 */

const canvas = document.createElement("canvas");
canvas.width = canvas.height = 1;
const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

/** Resolve any CSS colour syntax to sRGB bytes by asking the engine to paint it. */
function toRgb(color: string): [number, number, number] {
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "#000";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2]];
}

const channel = (c: number) => (c / 255 <= 0.04045 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4);
const luminance = ([r, g, b]: [number, number, number]) =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

function contrast(fg: string, bg: string): number {
  const a = luminance(toRgb(fg));
  const b = luminance(toRgb(bg));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

interface Measured {
  /** The colour the token resolved to, and its contrast against the pill. */
  derived: number;
  /** The same pill under the theme-flipped pair the token replaced. */
  flipped: number;
  foreground: [number, number, number];
}

async function measure(theme: "light" | "dark", variant: Variant): Promise<Measured> {
  const host = document.createElement("div");
  if (theme === "dark") host.className = "dark";
  document.body.appendChild(host);
  try {
    const view = render(
      <ToggleGroup
        visuals="labels"
        size={Size.Md}
        value="a"
        onChange={() => undefined}
        options={[
          { value: "a", label: "Published", variant },
          { value: "b", label: "All", variant },
        ]}
        label="Filter"
      />,
      { container: host },
    );
    // The pill positions itself in a layout effect and re-measures after fonts
    // land; colour does not depend on either, but reading after a frame keeps
    // this from racing a re-render.
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    const item = host.querySelector<HTMLElement>('[data-toggle-item="a"]')!;
    const pill = host.querySelector<HTMLElement>("[data-toggle-pill]")!;
    const fill = getComputedStyle(pill).backgroundColor;
    const foreground = getComputedStyle(item.querySelector<HTMLElement>("p")!).color;

    const result: Measured = {
      derived: contrast(foreground, fill),
      flipped: contrast(theme === "dark" ? "black" : "white", fill),
      foreground: toRgb(foreground),
    };
    view.unmount();
    return result;
  } finally {
    host.remove();
  }
}

// Control for the measurement itself: pure black on pure white is 21:1 by
// definition, so a broken colour parse shows up here rather than as a plausible
// wrong number in every case below.
test("the contrast measurement reproduces a known value", () => {
  expect(contrast("oklch(1 0 0)", "oklch(0 0 0)")).toBeCloseTo(21, 1);
});

const VARIANTS = [
  Variant.Default,
  Variant.Primary,
  Variant.Secondary,
  Variant.Tertiary,
  Variant.Success,
  Variant.Warning,
  Variant.Error,
  Variant.Info,
];

// The token's own contract: it resolves to one of the two extremes, never to a
// tinted near-black. Chroma and hue are zeroed in the `oklch(from …)` expression,
// so anything else means the derivation stopped resolving — which is what a
// browser without relative colour syntax falls back from, and what a rename of
// `--accent-color` would produce silently.
test.each(["light", "dark"] as const)("%s: the active label resolves to pure black or white", async (theme) => {
  for (const variant of VARIANTS) {
    const { foreground } = await measure(theme, variant);
    const isExtreme =
      foreground.every((c) => c === 0) || foreground.every((c) => c === 255);
    expect(isExtreme, `${theme}/${String(variant)} foreground ${foreground.join(",")}`).toBe(true);
  }
});

// Where the theme-flipped pair failed AA outright on this palette. These are the
// cases the token exists for, and each carries its own control: the assertion
// that the old pairing is BELOW the bar is what makes the pass meaningful.
const RESCUED = [Variant.Success, Variant.Warning, Variant.Info, Variant.Primary];

test("light mode: the derived foreground lifts the failing variants over 4.5:1", async () => {
  for (const variant of RESCUED) {
    const { derived, flipped } = await measure("light", variant);
    expect(flipped, `control — theme-flipped pair on ${String(variant)}`).toBeLessThan(4.5);
    expect(derived, `derived foreground on ${String(variant)}`).toBeGreaterThanOrEqual(4.5);
  }
});

// `Variant.Error` in light mode is the threshold's documented crossover: its fill
// sits just above the 0.57 oklch lightness cut, so black is chosen where white
// scores marginally higher. Measured at 4.40 derived against 4.77 flipped.
//
// Pinned rather than fixed. Moving the threshold is a change to a published token
// with 194 measured colours behind its current value, and it would trade this case
// for others; the bound here is a tripwire for the palette drifting further, not an
// endorsement of a sub-AA value.
test("light mode: Error is the threshold's crossover case and does not drift lower", async () => {
  const { derived, flipped } = await measure("light", Variant.Error);
  expect(derived).toBeGreaterThan(4.3);
  expect(derived).toBeLessThan(flipped);
});

// Dark mode was never the failing case — the accent is the lighter shade there, so
// black already won. This asserts the token did not make it worse.
test("dark mode: every variant clears 4.5:1", async () => {
  for (const variant of VARIANTS) {
    const { derived } = await measure("dark", variant);
    expect(derived, `dark/${String(variant)}`).toBeGreaterThanOrEqual(4.5);
  }
});
