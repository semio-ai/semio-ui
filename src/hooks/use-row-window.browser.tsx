import { useRef } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { useRowWindow } from "./use-row-window";

/**
 * The windowing arithmetic on its own.
 *
 * Two of these pin defects found while building the grids on top of it, both of which
 * presented as a blank list rather than as an obviously wrong number — the failure mode
 * worth having tests for, since a list that renders nothing still scrolls convincingly.
 */

const ROW = 20;
const VIEWPORT = 200;

function Probe({
  total,
  rowHeight = ROW,
  estimate = ROW,
  overscan = 2,
  pinnedIndex,
  jitter = 0,
}: {
  total: number;
  rowHeight?: number;
  estimate?: number;
  overscan?: number;
  pinnedIndex?: number;
  /** Sub-pixel variation between rows, as an unstyled list really has. */
  jitter?: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const window = useRowWindow({
    total,
    scrollRef,
    estimatedRowHeight: estimate,
    overscan,
    pinnedIndex,
  });
  return (
    <div>
      <span data-testid="range">{`${window.start.toString()}-${window.end.toString()}`}</span>
      <span data-testid="pinned">{String(window.pinnedIndexInWindow)}</span>
      <span data-testid="height">{window.rowHeight}</span>
      <div ref={scrollRef} style={{ height: VIEWPORT, overflowY: "auto" }} data-testid="scroller">
        <div style={{ height: window.paddingTop }} />
        {Array.from({ length: window.end - window.start }, (_, i) => (
          <div
            key={window.start + i}
            ref={i === 0 ? window.measureRef : undefined}
            style={{ height: rowHeight + ((window.start + i) % 2) * jitter }}
            data-row={window.start + i}
          >
            row {window.start + i}
          </div>
        ))}
        <div style={{ height: window.paddingBottom }} />
      </div>
    </div>
  );
}

const settle = async () => {
  for (let i = 0; i < 5; i++) {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  }
};
const read = (view: { container: HTMLElement }, id: string) =>
  view.container.querySelector<HTMLElement>(`[data-testid="${id}"]`)!.textContent;
const scroller = (view: { container: HTMLElement }) =>
  view.container.querySelector<HTMLElement>('[data-testid="scroller"]')!;

test("the window covers the viewport plus the overscan", async () => {
  const view = await render(<Probe total={1_000} />);
  await settle();
  // 200px viewport / 20px rows = 10 rows, plus 2 overscan below (none above at the top).
  expect(read(view, "range")).toBe("0-12");
});

test("the whole list is still the scroll height", async () => {
  const view = await render(<Probe total={1_000} />);
  await settle();
  expect(scroller(view).scrollHeight).toBe(1_000 * ROW);
});

test("a measured row height overrides the estimate", async () => {
  // Estimate deliberately wrong, as it is in any app that changes its root font size.
  const view = await render(<Probe total={1_000} rowHeight={25} estimate={40} />);
  await settle();
  expect(read(view, "height")).toBe("25");
  expect(scroller(view).scrollHeight).toBe(1_000 * 25);
});

test("scrolling to the bottom keeps the window inside the data", async () => {
  // The defect this pins: `start` was clamped at zero but not at the end, so a scroll
  // offset that denoted a row past the end produced an empty slice — one very tall
  // spacer, a working scrollbar, and no rows at all.
  //
  // Reached with a deliberately wrong estimate, which is what makes the offset and the
  // row height disagree for a commit: the list is first laid out at 40px per row and then
  // re-measured at 20, so a scroll near the old bottom denotes a row far past the new end.
  const view = await render(<Probe total={1_000} rowHeight={20} estimate={40} />);
  await settle();
  const element = scroller(view);
  element.scrollTop = element.scrollHeight;
  await settle();

  const [start, end] = read(view, "range")!.split("-").map(Number);
  expect(end).toBe(1_000);
  expect(start).toBeLessThan(end);
  expect(view.container.querySelectorAll("[data-row]").length).toBeGreaterThan(0);
  expect(view.container.querySelector('[data-row="999"]')).not.toBeNull();
});

test("an offset past the end still renders rows rather than a blank spacer", async () => {
  // The same invariant stated as the symptom: whatever the offset, the slice is never
  // empty while there is data.
  const view = await render(<Probe total={500} rowHeight={20} estimate={80} />);
  await settle();
  const element = scroller(view);
  element.scrollTop = 500 * 80;
  await settle();
  expect(view.container.querySelectorAll("[data-row]").length).toBeGreaterThan(0);
});

test("sub-pixel variation between rows does not move the measured height", async () => {
  // The measurement is re-taken whenever the ref lands on a different row, which is what
  // lets a list notice its styles arriving late — and is also what once fed the height back
  // from the scroll position, walking the geometry off the end of the data.
  //
  // A whole-pixel threshold is what makes both safe at once. Rows here differ by a third of
  // a pixel, as they do in an unstyled list where a row carrying a button is a hair taller
  // than one that does not, and the height must not budge across two long scrolls.
  const view = await render(<Probe total={1_000} rowHeight={25} estimate={40} jitter={0.34} />);
  await settle();
  const settled = read(view, "height");
  scroller(view).scrollTop = 500 * 25;
  await settle();
  expect(read(view, "height")).toBe(settled);
  scroller(view).scrollTop = 900 * 25;
  await settle();
  expect(read(view, "height")).toBe(settled);
  // Still inside the data, which is what the drift used to break.
  const [start, end] = read(view, "range")!.split("-").map(Number);
  expect(start).toBeLessThan(end);
  expect(end).toBeLessThanOrEqual(1_000);
});

test("a whole-pixel change in row height IS picked up", async () => {
  // The other side of the threshold: a real change — styles arriving, a font swapping — must
  // reach the geometry, or a list of 36px rows keeps windowing itself at 18.
  const view = await render(<Probe total={1_000} rowHeight={20} />);
  await settle();
  expect(read(view, "height")).toBe("20");
  expect(scroller(view).scrollHeight).toBe(1_000 * 20);

  await view.rerender(<Probe total={1_000} rowHeight={31} />);
  await settle();
  expect(read(view, "height")).toBe("31");
  expect(scroller(view).scrollHeight).toBe(1_000 * 31);
});

test("a pinned row near the window is mounted", async () => {
  const view = await render(<Probe total={1_000} pinnedIndex={13} />);
  await settle();
  expect(read(view, "pinned")).toBe("true");
  expect(view.container.querySelector('[data-row="13"]')).not.toBeNull();
});

test("a pinned row far from the window is reported, not reached for", async () => {
  // Extending the window to a distant cursor would mount every row in between and quietly
  // undo the windowing, so the hook says it could not and leaves the caller to decide.
  const view = await render(<Probe total={10_000} pinnedIndex={9_000} />);
  await settle();
  expect(read(view, "pinned")).toBe("false");
  expect(view.container.querySelectorAll("[data-row]").length).toBeLessThan(20);
});

test("an empty list is an empty window, not a negative one", async () => {
  const view = await render(<Probe total={0} />);
  await settle();
  expect(read(view, "range")).toBe("0-0");
  expect(scroller(view).scrollHeight).toBeLessThanOrEqual(VIEWPORT);
});

test("a sub-row scroll that uncovers a row is not coalesced away", async () => {
  // Scroll updates are collapsed to at most one render per row crossed, and the key for
  // that was the FIRST visible row alone. The exclusive end is derived with `ceil`, so one
  // pixel of scroll can move it while the first row stays put: at 20px rows in a 200px
  // viewport, 0 → 1px leaves the first row at 0 and takes the end from 10 to 11. Keyed on
  // the first row, that update was skipped and row 10 stayed behind the trailing spacer
  // until the next whole row was crossed.
  //
  // `overscan={0}` is what makes it observable — the default of 6 rows of slack covers a
  // single row of drift — so the defect could only ever have surfaced as one consumer's
  // blank strip rather than as anything the default configuration would show.
  const view = await render(<Probe total={1_000} overscan={0} />);
  await settle();
  expect(read(view, "range")).toBe("0-10");
  expect(view.container.querySelector('[data-row="10"]')).toBeNull();

  scroller(view).scrollTop = 1;
  await settle();

  expect(read(view, "range")).toBe("0-11");
  expect(view.container.querySelector('[data-row="10"]')).not.toBeNull();
});
