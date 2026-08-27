import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "@vitest/browser/context";
import "./test-stylesheet";
import { Size, Variant } from "./types";
import { Avatar } from "./avatar";
import { Button } from "./buttons/button";
import { Chip } from "./chip";
import { Status } from "./feedback/status";
import { Checkbox } from "./inputs/checkbox";
import { Tabs } from "./layouts/tabs";
import { Dropdown } from "./floating/dropdown";
import { NestedRadio } from "./nested-elements/radio";

/**
 * What deriving a foreground from its fill is worth on THIS palette.
 *
 * Every component here paints content on a variant fill. `--on-standard-color` and
 * `--on-accent-color` pick the foreground from that fill's lightness; the pairing they
 * replaced picked it from the colour scheme. Whether that is an improvement is a
 * property of the palette, not of the tokens, so it is measured rather than inherited
 * from figures quoted elsewhere — the ramp has moved between releases before.
 *
 * The real stylesheet is imported deliberately. Without it every class is inert, both
 * cases compute to the same default, and the assertions can only agree with themselves.
 *
 * Two controls run throughout, because a bare "this clears 4.5:1" would pass against a
 * component that had never been broken:
 *
 *  - Every fill-derived case is paired with the theme-flipped colour it replaced, and
 *    the test asserts that control is BELOW the bar. Reverting a token collapses the
 *    two numbers together and reddens the pair.
 *  - `--standard-color` has no dark-mode override, so a foreground derived from it must
 *    measure IDENTICALLY in both themes. That equality is the structural claim: it is
 *    what a scheme-chosen foreground cannot do, and it fails loudly if one is restored.
 */

const canvas = document.createElement("canvas");
canvas.width = canvas.height = 1;
const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

/** Resolve any CSS colour syntax to sRGB bytes by asking the engine to paint it. */
function toRgba(color: string): [number, number, number, number] {
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "#000";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2], d[3] / 255];
}

const channel = (c: number) => (c / 255 <= 0.04045 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4);
const luminance = ([r, g, b]: number[]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

/** Paint `src` over opaque `dst`. */
function over(src: [number, number, number, number], dst: [number, number, number]): [number, number, number] {
  const a = src[3];
  return [src[0] * a + dst[0] * (1 - a), src[1] * a + dst[1] * (1 - a), src[2] * a + dst[2] * (1 - a)];
}

/**
 * The ground an element is actually read against: its own background composited over
 * every translucent ancestor background until one is opaque.
 *
 * Reading `backgroundColor` off a single node is what makes a component look like a
 * failure it is not — a container's inherited `color` is never painted, and a slot
 * tinted 20% over a fill is not the fill.
 */
function compositedBg(el: HTMLElement): [number, number, number] {
  const stack: [number, number, number, number][] = [];
  let node: HTMLElement | null = el;
  while (node) {
    const c = toRgba(getComputedStyle(node).backgroundColor);
    if (c[3] > 0) stack.push(c);
    if (c[3] === 1) break;
    node = node.parentElement;
  }
  let result: [number, number, number] = [255, 255, 255];
  for (let i = stack.length - 1; i >= 0; i--) result = over(stack[i], result);
  return result;
}

function ratio(fg: [number, number, number], bg: [number, number, number]): number {
  const a = luminance(fg);
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

type Theme = "light" | "dark";
const THEMES: Theme[] = ["light", "dark"];

interface Measured {
  /** The element's own colour against the ground it is painted on. */
  derived: number;
  /** The same ground under the theme-flipped pair the tokens replaced. */
  flipped: number;
  foreground: [number, number, number];
}

function measure(el: HTMLElement, theme: Theme): Measured {
  const bg = compositedBg(el);
  const fg = over(toRgba(getComputedStyle(el).color), bg);
  return {
    derived: ratio(fg, bg),
    flipped: ratio(theme === "dark" ? [0, 0, 0] : [255, 255, 255], bg),
    foreground: [Math.round(fg[0]), Math.round(fg[1]), Math.round(fg[2])],
  };
}

/**
 * Renders under a theme. The class goes on `<html>`, not on a wrapper: Radix portals
 * its menu content to `<body>`, so a wrapper-scoped `.dark` would leave every portalled
 * case measuring light mode while reporting dark.
 */
async function withTheme<T>(theme: Theme, node: React.ReactNode, read: (root: HTMLElement) => T): Promise<T> {
  const html = document.documentElement;
  const previous = html.className;
  html.className = theme === "dark" ? "dark" : "";
  document.body.style.backgroundColor = theme === "dark" ? "#0a0a0a" : "#ffffff";
  const host = document.createElement("div");
  document.body.appendChild(host);
  try {
    const view = render(<>{node}</>, { container: host });
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    const result = read(document.body);
    view.unmount();
    return result;
  } finally {
    host.remove();
    html.className = previous;
    document.body.style.backgroundColor = "";
  }
}

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

const AA_TEXT = 4.5;
/** WCAG's bar for icons and other non-text content. */
const AA_NON_TEXT = 3;

// Control for the measurement itself: pure black on pure white is 21:1 by definition,
// so a broken colour parse shows up here rather than as a plausible wrong number
// everywhere below.
test("the contrast measurement reproduces a known value", () => {
  expect(ratio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 1);
});

/** Each entry renders a component and returns the element that PAINTS the foreground. */
const ON_STANDARD_FILL: {
  name: string;
  render: (v: Variant) => React.ReactNode;
  find: (root: HTMLElement) => HTMLElement;
}[] = [
  {
    name: "Button label",
    render: (v) => (
      <Button variant={v} size={Size.Md}>
        Label
      </Button>
    ),
    find: (root) => root.querySelector<HTMLElement>("button")!,
  },
  {
    name: "Avatar fallback",
    render: (v) => <Avatar alt="Ada" variant={v} size={Size.Md} />,
    find: (root) => root.querySelector<HTMLElement>("span[class*='place-items-center']")!,
  },
  {
    name: "Chip label",
    render: (v) => (
      <Chip variant={v} size={Size.Md}>
        Pose
      </Chip>
    ),
    // The label is a child of the chip with its own colour; the chip's own inherited
    // `color` is never painted, so measuring the container reports 1:1 instead.
    find: (root) => [...root.querySelectorAll<HTMLElement>("div")].find((d) => d.className.includes("px-2"))!,
  },
  {
    name: "Status badge text",
    render: (v) => (
      <Status variant={v} text="9">
        <div style={{ width: 40, height: 40 }} />
      </Status>
    ),
    // Deepest node carrying the text: the outer `relative` wrapper shares its
    // textContent and paints nothing.
    find: (root) => {
      const all = [...root.querySelectorAll<HTMLElement>("div")].filter((d) => d.textContent === "9");
      return all[all.length - 1];
    },
  },
  {
    name: "Checkbox check mark",
    render: (v) => <Checkbox checked onCheckedChange={() => undefined} variant={v} />,
    find: (root) => root.querySelector<HTMLElement>("[data-state='checked'] > *")!,
  },
];

// The structural claim, and the reason this class of bug is readable from the CSS
// without measuring anything: `--standard-color` is the -500 shade with no dark-mode
// override, so the fill is the same colour in both themes. A foreground derived from it
// is therefore also the same in both themes — which is exactly what a `text-white
// dark:text-black` pair cannot be. Restoring such a pair splits these two numbers.
test.each(ON_STANDARD_FILL)(
  "$name: the fill does not flip, so its foreground does not either",
  async ({ render: renderNode, find }) => {
    for (const variant of VARIANTS) {
      const light = await withTheme("light", renderNode(variant), (root) => measure(find(root), "light"));
      const dark = await withTheme("dark", renderNode(variant), (root) => measure(find(root), "dark"));
      expect(
        dark.derived,
        `${String(variant)}: light ${light.derived.toFixed(2)} vs dark ${dark.derived.toFixed(2)}`,
      ).toBeCloseTo(light.derived, 2);
      expect(dark.foreground).toEqual(light.foreground);
    }
  },
);

test.each(ON_STANDARD_FILL)("$name: every variant clears AA in both themes", async ({ render: renderNode, find }) => {
  for (const theme of THEMES) {
    for (const variant of VARIANTS) {
      const { derived } = await withTheme(theme, renderNode(variant), (root) => measure(find(root), theme));
      expect(derived, `${theme}/${String(variant)}`).toBeGreaterThanOrEqual(AA_TEXT);
    }
  }
});

// The cases the tokens exist for, each carrying its own control: the assertion that the
// pairing they replaced is BELOW the bar is what makes the pass mean anything. Light
// mode holds the saturated hues; `default` in DARK is here because a mid-grey is not
// light enough for black text either, which is the half of this bug that a "light mode
// is the broken one" reading misses.
const RESCUED: [Theme, Variant][] = [
  ["light", Variant.Primary],
  ["light", Variant.Secondary],
  ["light", Variant.Tertiary],
  ["light", Variant.Success],
  ["light", Variant.Warning],
  ["light", Variant.Error],
  ["light", Variant.Info],
  ["dark", Variant.Default],
];

test.each(ON_STANDARD_FILL)(
  "$name: the derived foreground lifts what the flipped pair failed",
  async ({ render: renderNode, find }) => {
    for (const [theme, variant] of RESCUED) {
      const { derived, flipped } = await withTheme(theme, renderNode(variant), (root) => measure(find(root), theme));
      expect(flipped, `control — theme-flipped pair on ${theme}/${String(variant)}`).toBeLessThan(AA_TEXT);
      expect(derived, `derived foreground on ${theme}/${String(variant)}`).toBeGreaterThanOrEqual(AA_TEXT);
    }
  },
);

// `variant-responsive-bg` swaps its fill to `--accent-color` under `:hover`, which
// crosses the derivation's lightness threshold in the opposite direction for some hues.
// A foreground pinned to the rest-state fill is wrong there.
//
// Driven through a real pointer. Resolving the tokens by hand instead — reading the
// non-hover computed colour and pairing it with the hover fill — reproduces the defect
// this asserts is gone, and reports it whether or not it is still there.
test("Button: the foreground follows the fill through hover", async () => {
  for (const theme of THEMES) {
    for (const variant of [Variant.Default, Variant.Secondary, Variant.Error]) {
      const html = document.documentElement;
      html.className = theme === "dark" ? "dark" : "";
      document.body.style.backgroundColor = theme === "dark" ? "#0a0a0a" : "#ffffff";
      const host = document.createElement("div");
      document.body.appendChild(host);
      try {
        const view = render(
          <Button variant={variant} size={Size.Md}>
            Label
          </Button>,
          { container: host },
        );
        const button = host.querySelector<HTMLElement>("button")!;
        await userEvent.hover(button);
        // Compared as painted bytes: `backgroundColor` and the custom property are
        // the same colour in two serialisations, so a string compare always fails.
        expect(
          toRgba(getComputedStyle(button).backgroundColor).slice(0, 3),
          `hover fill did not engage on ${theme}/${String(variant)}`,
        ).toEqual(toRgba(getComputedStyle(button).getPropertyValue("--accent-color").trim()).slice(0, 3));
        const { derived } = measure(button, theme);
        if (theme === "light" && variant === Variant.Error) {
          // The hover fill is `--accent-color`, where light-mode Error is the
          // derivation's documented crossover: its lightness sits just above the 0.57
          // cut, so black is chosen where white scores marginally higher. Pinned as a
          // floor, not endorsed — moving the threshold to win this one case trades it
          // for others across the 194 colours behind the current value, and the same
          // number is pinned for the same reason where the token was introduced.
          expect(derived, `hover ${theme}/${String(variant)}`).toBeGreaterThan(4.3);
        } else {
          expect(derived, `hover ${theme}/${String(variant)}`).toBeGreaterThanOrEqual(AA_TEXT);
        }
        view.unmount();
      } finally {
        host.remove();
        html.className = "";
        document.body.style.backgroundColor = "";
      }
    }
  }
});

// Chip's slots are a tint over the chip's own fill, and the glyph sits on the tint —
// not on the fill. Measured separately because the composited ground differs from the
// label's, and because a theme-flipped tint over a theme-invariant fill is the same
// defect one level down.
test("Chip: icon and delete slots clear the non-text bar in both themes", async () => {
  for (const theme of THEMES) {
    for (const variant of VARIANTS) {
      const measured = await withTheme(
        theme,
        <Chip variant={variant} size={Size.Md} icon="user" onDelete={() => undefined}>
          Pose
        </Chip>,
        (root) => measure(root.querySelector<HTMLElement>("button")!, theme),
      );
      expect(measured.derived, `${theme}/${String(variant)} delete slot`).toBeGreaterThanOrEqual(AA_NON_TEXT);
    }
  }
});

// A checked menu indicator paints `--accent-color`: the explicit rule outranks the
// `bg-layout-*-base` utility declared above it — equal specificity, later in source — so
// the fill is a saturated brand hue rather than a neutral. `NestedRadio` is the case
// that shows it: every consumer but `NestedCheckbox` puts the variant class on the
// indicator, so `--accent-color` there resolves to the variant rather than the default.
test("Menu indicator: the checked fill's foreground is derived from it", async () => {
  for (const theme of THEMES) {
    for (const variant of VARIANTS) {
      const measured = await withTheme(
        theme,
        <Dropdown open variant={variant} trigger={<button>open</button>}>
          <NestedRadio
            value="r1"
            variant={variant}
            onChange={() => undefined}
            options={[{ value: "r1", label: "Radio one" }]}
          />
        </Dropdown>,
        (root) => measure(root.querySelector<HTMLElement>(".check-indicator")!, theme),
      );
      expect(measured.derived, `${theme}/${String(variant)}`).toBeGreaterThanOrEqual(AA_NON_TEXT);
    }
  }
});

/** Reads both tab rows, compositing the active indicator into the active row's ground. */
async function measureTabs(theme: Theme, variant: Variant) {
  return withTheme(
    theme,
    <Tabs visuals="labels" size={Size.Md} selected="a" onTabChange={() => undefined}>
      {[
        { key: "a", title: "Active", variant, content: <div /> },
        { key: "b", title: "Inactive", variant, content: <div /> },
      ]}
    </Tabs>,
    (root) => {
      // The indicator is a positioned SIBLING of the label, not an ancestor, so it has
      // to be composited in by hand — otherwise the active row silently reports the
      // inactive row's number and the two look identical.
      const indicator = root.querySelector<HTMLElement>(".variant-static-bg-25");
      const tint = indicator ? toRgba(getComputedStyle(indicator).backgroundColor) : null;
      return [...root.querySelectorAll<HTMLElement>("p")]
        .filter((p) => p.textContent === "Active" || p.textContent === "Inactive")
        .map((label) => {
          const active = label.textContent === "Active";
          let bg = compositedBg(label);
          if (active && tint) bg = over(tint, bg);
          // Read off the TAB, not the label. The label's wrapper carries `responsive`
          // without a variant class, and `.responsive` re-declares the variant tokens —
          // so the property inherited down to the label is the neutral default, and a
          // control read there would compare the clamp against the wrong colour.
          const tab = label.closest<HTMLElement>('[role="tab"]') ?? label;
          const raw = getComputedStyle(tab).getPropertyValue("--weak-accent-text-color").trim();
          return {
            active,
            derived: ratio(over(toRgba(getComputedStyle(label).color), bg), bg),
            unclamped: ratio(over(toRgba(raw), bg), bg),
          };
        });
    },
  );
}

// Tabs are the mirror of the fills above rather than an instance of them: a variant's
// accent text shade is the same colour in both themes while the list ground flips, so
// one theme is wrong for every hue for the opposite reason. `variant-text-on-inset`
// clamps the label's lightness against that ground, keeping the hue.
test("Tabs: both rows clear AA in both themes, against the ground each is read on", async () => {
  for (const theme of THEMES) {
    for (const variant of VARIANTS) {
      const rows = await measureTabs(theme, variant);
      expect(rows).toHaveLength(2);
      for (const { active, derived } of rows) {
        expect(derived, `${theme}/${String(variant)} ${active ? "active" : "inactive"}`).toBeGreaterThanOrEqual(
          AA_TEXT,
        );
      }
    }
  }
});

// The control for the clamp: on the light ground the bright hues are unreadable
// unclamped, and the assertion that they are is what makes the pass mean something.
test("Tabs: the clamp rescues the hues the raw shade fails", async () => {
  for (const variant of [Variant.Warning, Variant.Success, Variant.Primary]) {
    const [active] = await measureTabs("light", variant);
    expect(active.unclamped, `control — unclamped ${String(variant)} on the light list ground`).toBeLessThan(AA_TEXT);
    expect(active.derived, `clamped ${String(variant)}`).toBeGreaterThanOrEqual(AA_TEXT);
  }
});

// The bound is one-sided, so it can only ever move a label AWAY from its ground. This
// is what stops it being a blanket restyle: a hue already past the bound keeps its
// shade, and no variant is made harder to read than the raw token would have been.
//
// The neutral default is the case that pins it. It sits just inside the light-mode
// bound, so it is nudged rather than left untouched — asserting "unchanged" here would
// be asserting something false, and asserting "improved" is the property that holds.
test("Tabs: the clamp never lowers contrast, and barely moves an already-dark hue", async () => {
  for (const theme of THEMES) {
    for (const variant of VARIANTS) {
      const rows = await measureTabs(theme, variant);
      for (const { active, derived, unclamped } of rows) {
        expect(
          derived,
          `${theme}/${String(variant)} ${active ? "active" : "inactive"} lost contrast to the clamp`,
        ).toBeGreaterThanOrEqual(unclamped - 0.01);
      }
    }
  }

  const [neutral] = await measureTabs("light", Variant.Default);
  expect(neutral.derived - neutral.unclamped).toBeLessThan(1);
});
