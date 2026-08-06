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
}: {
  total: number;
  rowHeight?: number;
  estimate?: number;
  overscan?: number;
  pinnedIndex?: number;
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
            style={{ height: rowHeight }}
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
  const view = render(<Probe total={1_000} />);
  await settle();
  // 200px viewport / 20px rows = 10 rows, plus 2 overscan below (none above at the top).
  expect(read(view, "range")).toBe("0-12");
});

test("the whole list is still the scroll height", async () => {
  const view = render(<Probe total={1_000} />);
  await settle();
  expect(scroller(view).scrollHeight).toBe(1_000 * ROW);
});

test("a measured row height overrides the estimate", async () => {
  // Estimate deliberately wrong, as it is in any app that changes its root font size.
  const view = render(<Probe total={1_000} rowHeight={25} estimate={40} />);
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
  const view = render(<Probe total={1_000} rowHeight={20} estimate={40} />);
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
  const view = render(<Probe total={500} rowHeight={20} estimate={80} />);
  await settle();
  const element = scroller(view);
  element.scrollTop = 500 * 80;
  await settle();
  expect(view.container.querySelectorAll("[data-row]").length).toBeGreaterThan(0);
});

test("the row height is measured once, not once per window", async () => {
  // The other half of that defect: re-measuring the first row of each new window fed the
  // height back from the scroll position, so any variation between rows walked the
  // geometry away from the data. Rows here differ from the estimate, and the height must
  // settle on one value and stay there across a scroll.
  const view = render(<Probe total={1_000} rowHeight={25} estimate={40} />);
  await settle();
  const settled = read(view, "height");
  scroller(view).scrollTop = 500 * 25;
  await settle();
  expect(read(view, "height")).toBe(settled);
  scroller(view).scrollTop = 900 * 25;
  await settle();
  expect(read(view, "height")).toBe(settled);
});

test("a pinned row near the window is mounted", async () => {
  const view = render(<Probe total={1_000} pinnedIndex={13} />);
  await settle();
  expect(read(view, "pinned")).toBe("true");
  expect(view.container.querySelector('[data-row="13"]')).not.toBeNull();
});

test("a pinned row far from the window is reported, not reached for", async () => {
  // Extending the window to a distant cursor would mount every row in between and quietly
  // undo the windowing, so the hook says it could not and leaves the caller to decide.
  const view = render(<Probe total={10_000} pinnedIndex={9_000} />);
  await settle();
  expect(read(view, "pinned")).toBe("false");
  expect(view.container.querySelectorAll("[data-row]").length).toBeLessThan(20);
});

test("an empty list is an empty window, not a negative one", async () => {
  const view = render(<Probe total={0} />);
  await settle();
  expect(read(view, "range")).toBe("0-0");
  expect(scroller(view).scrollHeight).toBeLessThanOrEqual(VIEWPORT);
});
