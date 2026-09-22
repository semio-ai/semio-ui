import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "../test-stylesheet";
import { Size, Variant } from "../types";
import { StatusBadge } from "./status-badge";

/**
 * `StatusBadge` has two forms and they are sized by different rules: the dot is a mark, and
 * the counted badge is a box around a numeral. This pins the counted one.
 *
 * The real stylesheet is imported deliberately — every claim here is about geometry
 * that only exists once the size scale resolves. Without it each class is inert, every
 * size measures the same, and the assertions agree with themselves.
 */

const SIZES = [Size.Xs, Size.Sm, Size.Md, Size.Lg, Size.Xl];

interface Box {
  width: number;
  height: number;
  contentHeight: number;
  fontSize: number;
  lineHeight: number;
}

function read(el: HTMLElement): Box {
  const style = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  const lineHeight = parseFloat(style.lineHeight);
  return {
    width: rect.width,
    height: rect.height,
    contentHeight: rect.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom),
    fontSize: parseFloat(style.fontSize),
    // `normal` parses as NaN. The counted form pins line-height precisely so its height
    // is not a guess about the font's default leading, so fall back to a generous
    // estimate rather than to zero — a NaN must not quietly satisfy the fit assertion.
    lineHeight: Number.isNaN(lineHeight) ? parseFloat(style.fontSize) * 1.5 : lineHeight,
  };
}

function withBadge<T>(size: Size, text: string | undefined, take: (el: HTMLElement) => T): T {
  const host = document.createElement("div");
  document.body.appendChild(host);
  try {
    const view = render(
      <StatusBadge variant={Variant.Primary} size={size} text={text}>
        <div style={{ width: 40, height: 40 }} />
      </StatusBadge>,
      { container: host },
    );
    // The badge is the node carrying `rounded-full`; the outer `relative` wrapper shares
    // its textContent and has no box of its own.
    const candidates = [...host.querySelectorAll<HTMLElement>("div")].filter((d) =>
      d.className.includes("rounded-full"),
    );
    const result = take(candidates[candidates.length - 1]);
    view.unmount();
    return result;
  } finally {
    host.remove();
  }
}

// A fixed box makes the `size` prop a no-op, and every size renders the same square.
// Asserting the heights are all DISTINCT is what catches that; a bare "it is at least N
// tall" passes on a constant and would report the prop as working while it does nothing.
test("the counted badge grows with `size`", () => {
  const heights = SIZES.map((size) => withBadge(size, "9", read).height);
  expect(new Set(heights).size, `heights were ${heights.join(", ")}`).toBe(SIZES.length);
  for (let i = 1; i < heights.length; i++) {
    expect(heights[i], `${String(SIZES[i])} vs ${String(SIZES[i - 1])}`).toBeGreaterThan(
      heights[i - 1],
    );
  }
});

// The box has to be able to hold the text it contains. Fixed values had this backwards:
// 4px of vertical padding inside a 10px border-box left a 2px content box for a 10.5px
// line box, so the glyph overflowed by ~8px and only looked centred because flex
// centring ignores overflow.
test("the counted badge's content box holds its own line box", () => {
  for (const size of SIZES) {
    const box = withBadge(size, "9", read);
    expect(box.contentHeight, `${String(size)} content box vs line box`).toBeGreaterThanOrEqual(
      box.lineHeight,
    );
    expect(box.contentHeight, `${String(size)} content box`).toBeGreaterThan(0);
  }
});

// Width comes from content rather than a character count, so a longer count widens the
// badge instead of crowding or clipping it. The previous inline `text.length * 6` gave a
// two-digit badge 12px — narrower than its own padding plus digits.
test("the counted badge widens for more digits, and stays a circle for one", () => {
  const one = withBadge(Size.Md, "9", read);
  const two = withBadge(Size.Md, "12", read);
  const three = withBadge(Size.Md, "999", read);

  expect(one.width, "a single digit should be as wide as it is tall").toBeCloseTo(one.height, 0);
  expect(two.width, "two digits").toBeGreaterThan(one.width);
  expect(three.width, "three digits").toBeGreaterThan(two.width);
});

// The box comes from the spacing scale, which is rem-based. An absolute font-size would
// therefore hold still while the box grew, so a reader who raises their browser's text
// size would get a larger badge around the same tiny numeral. Asserting the RATIO is
// what catches that: both halves may scale, but they must scale together.
test("the counted badge scales as one thing with the root font size", () => {
  const html = document.documentElement;
  const previous = html.style.fontSize;
  try {
    html.style.fontSize = "16px";
    const base = SIZES.map((size) => withBadge(size, "9", read));
    html.style.fontSize = "24px";
    const grown = SIZES.map((size) => withBadge(size, "9", read));

    for (let i = 0; i < SIZES.length; i++) {
      const label = String(SIZES[i]);
      // The box must actually respond, or the ratio holds for the wrong reason.
      expect(grown[i].height, `${label} box did not scale`).toBeGreaterThan(base[i].height);
      expect(grown[i].height / grown[i].fontSize, `${label} box-to-type ratio`).toBeCloseTo(
        base[i].height / base[i].fontSize,
        1,
      );
    }
  } finally {
    html.style.fontSize = previous;
  }
});

// The two forms share a component and must not share a scale. This is the control on the
// change: it asserts the dot was left exactly where it was.
test("the dot form keeps its own scale", () => {
  const dots = SIZES.map((size) => withBadge(size, undefined, read));
  expect(dots.map((d) => Math.round(d.height * 10) / 10)).toEqual([4.8, 7.2, 10, 12, 16]);
  for (const dot of dots) {
    expect(dot.width).toBeCloseTo(dot.height, 1);
  }
});
