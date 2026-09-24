import { afterEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { useState } from "react";
import { Size, Variant } from "../types";
import { ToggleGroup } from "./toggle-group";

// The highlight pill's geometry is the thing under test, and every way it broke
// was layout-and-timing: a ref that resolved to the wrong node through
// `Tooltip`'s `asChild` trigger, a measurement taken before the webfont swapped,
// and a tween that could be interrupted mid-flight. None of that reproduces in
// jsdom — a real engine with real text metrics and a real `ResizeObserver` is
// the only place the pill can land in the wrong place at all. Hence browser mode.
//
// Checked by reintroducing each failure individually: measuring only on mount
// plus a window `resize` fails the re-measure test, and taking width off the
// declared style fails all four. The `asChild` ref does NOT fail here — putting
// the old ref-collection mechanism back leaves these tests green, because
// nothing in a bare render triggers the trigger re-render that detached the
// node in the app. So these assert the outcome (the pill's box coincides with
// the active item's), not the mechanism; treat the query-by-attribute lookup in
// the component as unguarded and reason about it directly if it changes.

// These tests declare the handful of layout primitives the pill's correctness
// rests on rather than importing `test-stylesheet`: the root must establish the
// containing block, the pill must be taken out of flow at its origin, and the
// track must lay items out in a row. Everything else the design system
// contributes is size, which these tests never assert in absolute terms — they
// only compare the pill's box against the item's.
//
// The real compiled stylesheet IS available here, so this is a choice and not a
// limitation. It carries the pill's `transition-[transform,width]`, and a
// transitioning element's `getBoundingClientRect()` returns the value it is
// currently animating through — so a single read lands mid-flight and reports
// the class's own width instead of the measured one. Measured with the real
// sheet loaded: 28px against the item's 154px. The shim omits the transition, so
// every box read below is a settled value. Anything asserting PAINT rather than
// geometry needs the real sheet and belongs in a file that imports it, as
// `toggle-group-contrast.browser.tsx` does.
const LAYOUT_SHIM = `
  /* Tailwind's preflight, which every consumer loads, strips the UA button
   * chrome. It matters here and is not cosmetic: the component measures items
   * with \`clientWidth\` (content + padding, no border), so leaving Chromium's
   * default 2px button border in place would put the painted border box 4px
   * wider than the pill and fail these assertions for a reason the real app
   * does not have. */
  button { border: 0; padding: 0; font: inherit; background: none; }

  .relative { position: relative; }
  .absolute { position: absolute; }
  .left-0 { left: 0; }
  .inline-flex { display: inline-flex; }
  .items-center { align-items: center; }
  .justify-center { justify-content: center; }
  .grid { display: grid; }
  .p-0\\.5 { padding: 2px; }
  .px-2 { padding-left: 8px; padding-right: 8px; }
  .text-nowrap { text-wrap: nowrap; }
  [data-toggle-pill] { height: 24px; }
`;

// Browser mode shares one document across every test in a file, so anything put
// in `<head>` outlives the test that added it. Left untracked, the widening rule
// below leaked into the following test — which then measured 28px text while
// claiming to describe a normal first paint.
const injected: HTMLStyleElement[] = [];

function injectCss(css: string): void {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
  injected.push(style);
}

afterEach(() => {
  for (const style of injected.splice(0)) style.remove();
});

function useLayoutShim(extra = ""): void {
  injectCss(LAYOUT_SHIM + extra);
}

// Deliberately uneven label lengths: a pill that measured the wrong item, or
// measured before text settled, lands visibly off when every item is a
// different width. Equal-width items would hide exactly the bug being guarded.
const OPTIONS = [
  { value: "a", label: "In projects", variant: Variant.Primary },
  { value: "b", label: "Published", variant: Variant.Secondary },
  { value: "c", label: "All", variant: Variant.Tertiary },
  { value: "d", label: "Unpublished drafts", color: "#ee33ee" },
];

function Harness({ initial = "a" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <ToggleGroup
      visuals="labels"
      size={Size.Md}
      value={value}
      onChange={setValue}
      options={OPTIONS}
      label="Filter"
    />
  );
}

const pillEl = () => document.querySelector<HTMLElement>("[data-toggle-pill]")!;
const itemEl = (value: string) =>
  document.querySelector<HTMLElement>(`[data-toggle-item="${value}"]`)!;

/**
 * The pill's left edge and width, as rendered. Read from the box the browser
 * actually painted rather than from the component's own state, so the assertion
 * is independent of how the component arrived at the number.
 */
function pillBox(): { left: number; width: number } {
  const root = pillEl().offsetParent as HTMLElement;
  const pill = pillEl().getBoundingClientRect();
  const origin = root.getBoundingClientRect();
  return { left: pill.left - origin.left, width: pill.width };
}

function itemBox(value: string): { left: number; width: number } {
  const item = itemEl(value);
  const root = pillEl().offsetParent as HTMLElement;
  const rect = item.getBoundingClientRect();
  return { left: rect.left - root.getBoundingClientRect().left, width: rect.width };
}

function expectPillOver(value: string): void {
  const pill = pillBox();
  const item = itemBox(value);
  // Sub-pixel tolerance only: the pill is supposed to sit exactly on the item,
  // and the failure this guards (a pill clipping "Pu|blished") was tens of px.
  expect(pill.width, `pill width vs item "${value}"`).toBeCloseTo(item.width, 0);
  expect(pill.left, `pill left vs item "${value}"`).toBeCloseTo(item.left, 0);
}

test("pill covers the active item, whose trigger is wrapped by Tooltip", async () => {
  useLayoutShim();
  await render(<Harness />);

  // Every item is inside `Tooltip` → Radix `Trigger asChild`, which is what made
  // a collected ref unreliable. Waiting rather than asserting immediately allows
  // for the post-font-load re-measure; it must converge on the item's box.
  await vi.waitFor(() => expectPillOver("a"));

  // A real measurement happened — not a zero/default that trivially matches.
  expect(pillBox().width).toBeGreaterThan(0);
});

test("pill follows the selection to each item's own box", async () => {
  useLayoutShim();
  await render(<Harness />);
  await vi.waitFor(() => expectPillOver("a"));

  for (const value of ["c", "d", "b", "a"]) {
    await userEvent.click(itemEl(value));
    await vi.waitFor(() => expectPillOver(value));
  }
});

test("pill re-measures when item metrics change without a window resize", async () => {
  useLayoutShim();
  await render(<Harness />);
  await vi.waitFor(() => expectPillOver("a"));

  const before = pillBox().width;

  // Stands in for the webfont swap: text metrics change, so items change width,
  // but the window never resizes — the exact case the old mount-plus-`resize`
  // measurement missed and the `ResizeObserver` on the root is there to catch.
  injectCss(`[data-toggle-item] { font-size: 28px; letter-spacing: 2px; }`);

  await vi.waitFor(() => {
    expect(pillBox().width).toBeGreaterThan(before);
    expectPillOver("a");
  });
});

test("pill width is declared on first paint, not animated up from zero", async () => {
  useLayoutShim();
  await render(<Harness initial="d" />);

  // The stranded-tween failure showed as a pill left at its `initial` geometry.
  // Width must therefore be a resolved inline style, and the transition must
  // stay off until there is a real width to transition from.
  await vi.waitFor(() => {
    expect(pillEl().style.width).not.toBe("");
    expect(pillEl().style.width).not.toBe("0px");
  });
  expectPillOver("d");

  const declared = Number.parseFloat(pillEl().style.width);
  expect(declared).toBeCloseTo(itemEl("d").clientWidth, 0);
});

test("pill hides rather than stranding when no option matches the value", async () => {
  useLayoutShim();

  // A value with no matching option is reachable in practice: options loaded
  // async, or the value arrived stale from the URL.
  function Swappable({ value }: { value: string }) {
    return (
      <ToggleGroup
        visuals="labels"
        size={Size.Md}
        value={value}
        onChange={() => undefined}
        options={OPTIONS}
        label="Filter"
      />
    );
  }

  const view = await render(<Swappable value="d" />);
  await vi.waitFor(() => expectPillOver("d"));
  const strandedAt = pillEl().style.transform;

  await view.rerender(<Swappable value="does-not-exist" />);

  // Previously the measure call bailed out and left `left`/`width` untouched, so
  // the pill stayed parked behind "d" — in the default grey, since there is no
  // active option to take a variant from.
  await vi.waitFor(() => {
    expect(pillEl().hidden).toBe(true);
    expect(pillEl().style.width).toBe("");
  });
  expect(pillEl().getBoundingClientRect().width).toBe(0);

  // Recovering must land in the right place, not pass through the stale one.
  await view.rerender(<Swappable value="b" />);
  await vi.waitFor(() => {
    expect(pillEl().hidden).toBe(false);
    expectPillOver("b");
  });
  expect(pillEl().style.transform).not.toBe(strandedAt);
});
